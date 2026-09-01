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

// Helper to format phone cleanly
export const cleanPhone = (p) => {
  if (!p) return '';
  let phone = p.toString().trim().replace(/\s+/g, '');
  if (phone.startsWith('0')) {
    phone = '254' + phone.slice(1);
  } else if (phone.startsWith('+254')) {
    phone = phone.slice(1);
  }
  return phone;
};

// Generate phone variations array for matching all representations (07..., 254..., +254...)
const getPhoneVariations = (rawPhone) => {
  const formatted = cleanPhone(rawPhone);
  const variations = new Set();
  if (formatted) {
    variations.add(formatted);
    variations.add('+' + formatted);
    if (formatted.startsWith('254') && formatted.length === 12) {
      variations.add('0' + formatted.slice(3));
    }
  }
  if (rawPhone) {
    variations.add(rawPhone.toString().trim());
  }
  return Array.from(variations);
};

// Seed default Admin & Demo users into inMemoryUsers cache at start
const seedInMemoryUsers = async () => {
  try {
    const adminPhone = cleanPhone(process.env.ADMIN_PHONE || '254700000000');
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const adminHash = await bcrypt.hash(adminPassword, 10);
    const adminUser = {
      _id: 'admin_root_id',
      id: 'admin_root_id',
      fullName: 'System Administrator',
      phone: adminPhone,
      password: adminHash,
      role: 'admin',
      balance: 100000
    };
    inMemoryUsers.set(adminPhone, adminUser);
    inMemoryUsers.set('admin_root_id', adminUser);

    const demoPhone = '254712345678';
    const demoHash = await bcrypt.hash('User@123', 10);
    const demoUser = {
      _id: 'demo_user_id',
      id: 'demo_user_id',
      fullName: 'Demo Player',
      phone: demoPhone,
      password: demoHash,
      role: 'user',
      balance: 5000
    };
    inMemoryUsers.set(demoPhone, demoUser);
    inMemoryUsers.set('demo_user_id', demoUser);
  } catch (e) {
    console.error('Failed to seed in-memory admin/demo users:', e.message);
  }
};

seedInMemoryUsers();

// @route   POST /api/auth/register
// @desc    Register a new user with fullName, phone, password into MongoDB
router.post('/register', async (req, res) => {
  try {
    const { fullName, phone, password } = req.body;

    if (!fullName || !phone || !password) {
      return res.status(400).json({ error: 'Please provide full name, phone number, and password.' });
    }

    const formattedPhone = cleanPhone(phone);
    const phoneVariations = getPhoneVariations(phone);

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Try storing in MongoDB (Primary Database)
    try {
      const existingUser = await User.findOne({ phone: { $in: phoneVariations } });
      if (existingUser) {
        return res.status(400).json({ error: 'An account with this phone number already exists.' });
      }

      const newUser = new User({
        fullName: fullName.trim(),
        phone: formattedPhone,
        password: hashedPassword,
        role: 'user',
        balance: 0
      });

      await newUser.save();
      console.log(`[MongoDB] Successfully registered user: ${formattedPhone} (ID: ${newUser._id})`);

      const token = jwt.sign({ id: newUser._id.toString(), role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

      // Cache user in memory for instant sync
      inMemoryUsers.set(formattedPhone, newUser);
      inMemoryUsers.set(newUser._id.toString(), newUser);

      return res.status(201).json({
        message: 'Registration successful!',
        token,
        user: {
          id: newUser._id.toString(),
          fullName: newUser.fullName,
          phone: newUser.phone,
          role: newUser.role,
          balance: newUser.balance
        }
      });

    } catch (dbErr) {
      console.warn('[MongoDB Registration Warning] Falling back to in-memory store:', dbErr.message);
    }

    // 2. In-memory fallback if MongoDB connection fails
    if (inMemoryUsers.has(formattedPhone)) {
      return res.status(400).json({ error: 'An account with this phone number already exists.' });
    }

    const mockId = 'usr_' + Math.random().toString(36).substring(2, 9);
    const mockUser = {
      _id: mockId,
      id: mockId,
      fullName: fullName.trim(),
      phone: formattedPhone,
      password: hashedPassword,
      role: 'user',
      balance: 0
    };

    inMemoryUsers.set(formattedPhone, mockUser);
    inMemoryUsers.set(mockId, mockUser);

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
// @desc    Login user with phone number and password from MongoDB
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Please provide phone number and password.' });
    }

    const formattedPhone = cleanPhone(phone);
    const phoneVariations = getPhoneVariations(phone);
    const adminEnvPhone = cleanPhone(process.env.ADMIN_PHONE || '254700000000');

    // 1. Try finding user in MongoDB (Primary Database)
    try {
      let user = await User.findOne({ phone: { $in: phoneVariations } });

      // If logging in with env Admin phone and DB doesn't have record yet
      if (!user && (formattedPhone === adminEnvPhone || phone === process.env.ADMIN_PHONE)) {
        const adminPass = process.env.ADMIN_PASSWORD || 'Admin@123';
        if (password === adminPass) {
          const hash = await bcrypt.hash(adminPass, 10);
          user = new User({
            fullName: 'System Administrator',
            phone: adminEnvPhone,
            password: hash,
            role: 'admin',
            balance: 100000
          });
          await user.save();
          console.log(`[MongoDB] Created missing admin account on login: ${adminEnvPhone}`);
        }
      }

      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          const token = jwt.sign({ id: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: '7d' });
          
          // Cache in memory for quick socket / engine lookup
          inMemoryUsers.set(user.phone, user);
          inMemoryUsers.set(user._id.toString(), user);

          return res.json({
            message: 'Login successful',
            token,
            user: {
              id: user._id.toString(),
              fullName: user.fullName,
              phone: user.phone,
              role: user.role,
              balance: user.balance
            }
          });
        } else {
          return res.status(400).json({ error: 'Invalid phone number or password.' });
        }
      }
    } catch (dbErr) {
      console.warn('[MongoDB Login Warning] Falling back to in-memory check:', dbErr.message);
    }

    // 2. Fallback check in inMemoryUsers map
    let mockUser = inMemoryUsers.get(formattedPhone) || inMemoryUsers.get(phone);

    // Check if logging in as Admin in-memory
    if (!mockUser && (formattedPhone === adminEnvPhone || phone === process.env.ADMIN_PHONE)) {
      mockUser = inMemoryUsers.get(adminEnvPhone) || inMemoryUsers.get('admin_root_id');
    }

    if (mockUser) {
      const isMatch = await bcrypt.compare(password, mockUser.password);
      if (isMatch) {
        const token = jwt.sign({ id: mockUser.id || mockUser._id, role: mockUser.role }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({
          message: 'Login successful',
          token,
          user: {
            id: mockUser.id || mockUser._id,
            fullName: mockUser.fullName,
            phone: mockUser.phone,
            role: mockUser.role,
            balance: mockUser.balance
          }
        });
      }
    }

    return res.status(400).json({ error: 'Invalid phone number or password.' });

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
          id: (req.user._id || req.user.id).toString(),
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
// @desc    Update user profile details in MongoDB
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { fullName, newPassword } = req.body;
    let updatedUser = req.user;

    if (req.user._id) {
      try {
        const dbUser = await User.findById(req.user._id);
        if (dbUser) {
          if (fullName) dbUser.fullName = fullName.trim();
          if (newPassword) dbUser.password = await bcrypt.hash(newPassword, 10);
          await dbUser.save();
          updatedUser = dbUser;
        }
      } catch (e) {}
    }

    if (fullName) updatedUser.fullName = fullName.trim();
    if (newPassword) updatedUser.password = await bcrypt.hash(newPassword, 10);

    // Update in-memory map
    if (updatedUser.phone) inMemoryUsers.set(updatedUser.phone, updatedUser);
    if (updatedUser._id) inMemoryUsers.set(updatedUser._id.toString(), updatedUser);

    return res.json({
      message: 'Profile updated successfully',
      user: {
        id: (updatedUser._id || updatedUser.id).toString(),
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        role: updatedUser.role,
        balance: updatedUser.balance
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

export default router;
