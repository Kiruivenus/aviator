import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'aviator_secret_key_2026_super_secure';

// In-memory fallback user store when MongoDB is offline
export const inMemoryUsers = new Map();

// Helper to format phone
const cleanPhone = (p) => {
  if (!p) return '';
  let phone = p.toString().trim().replace(/\s+/g, '');
  if (phone.startsWith('0')) {
    phone = '254' + phone.slice(1);
  } else if (phone.startsWith('+254')) {
    phone = phone.slice(1);
  }
  return phone;
};

// @route   POST /api/auth/register
// @desc    Register a new user with fullName, phone, password
router.post('/register', async (req, res) => {
  try {
    const { fullName, phone, password } = req.body;

    if (!fullName || !phone || !password) {
      return res.status(400).json({ error: 'Please provide full name, phone number, and password.' });
    }

    const formattedPhone = cleanPhone(phone);

    // If MongoDB is connected, use Mongoose
    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ phone: formattedPhone });
      if (existingUser) {
        return res.status(400).json({ error: 'An account with this phone number already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        fullName: fullName.trim(),
        phone: formattedPhone,
        password: hashedPassword,
        role: 'user',
        balance: 1000
      });

      await newUser.save();

      const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        message: 'Registration successful!',
        token,
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          phone: newUser.phone,
          role: newUser.role,
          balance: newUser.balance
        }
      });
    }

    // In-memory fallback if MongoDB is not running locally
    if (inMemoryUsers.has(formattedPhone)) {
      return res.status(400).json({ error: 'An account with this phone number already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const mockId = 'usr_' + Math.random().toString(36).substring(2, 9);
    const mockUser = {
      _id: mockId,
      id: mockId,
      fullName: fullName.trim(),
      phone: formattedPhone,
      password: hashedPassword,
      role: 'user',
      balance: 1000
    };

    inMemoryUsers.set(formattedPhone, mockUser);

    const token = jwt.sign({ id: mockId, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: {
        id: mockUser.id,
        fullName: mockUser.fullName,
        phone: mockUser.phone,
        role: mockUser.role,
        balance: mockUser.balance
      }
    });

  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ error: 'Failed to process registration request.' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user with phone number and password
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Please provide phone number and password.' });
    }

    const formattedPhone = cleanPhone(phone);

    // If MongoDB is connected, use Mongoose
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ phone: formattedPhone });
      if (!user) {
        return res.status(400).json({ error: 'Invalid phone number or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid phone number or password.' });
      }

      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          balance: user.balance
        }
      });
    }

    // In-memory fallback if MongoDB is not running locally
    const mockUser = inMemoryUsers.get(formattedPhone);
    if (!mockUser) {
      return res.status(400).json({ error: 'Invalid phone number or password.' });
    }

    const isMatch = await bcrypt.compare(password, mockUser.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid phone number or password.' });
    }

    const token = jwt.sign({ id: mockUser.id, role: mockUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: mockUser.id,
        fullName: mockUser.fullName,
        phone: mockUser.phone,
        role: mockUser.role,
        balance: mockUser.balance
      }
    });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Failed to process login request.' });
  }
});

// @route   GET /api/auth/me
// @desc    Get logged in user profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    if (req.user) {
      return res.json({
        user: {
          id: req.user._id || req.user.id,
          fullName: req.user.fullName,
          phone: req.user.phone,
          role: req.user.role,
          balance: req.user.balance
        }
      });
    }
    res.status(401).json({ error: 'Not authenticated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile details
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { fullName, newPassword } = req.body;
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user._id);
      if (fullName) user.fullName = fullName.trim();
      if (newPassword) user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      return res.json({
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          balance: user.balance
        }
      });
    }

    // In-memory fallback
    if (req.user) {
      if (fullName) req.user.fullName = fullName.trim();
      if (newPassword) req.user.password = await bcrypt.hash(newPassword, 10);
      return res.json({
        message: 'Profile updated successfully',
        user: {
          id: req.user.id,
          fullName: req.user.fullName,
          phone: req.user.phone,
          role: req.user.role,
          balance: req.user.balance
        }
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

export default router;
