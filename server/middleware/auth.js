import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { inMemoryUsers } from '../routes/authRoutes.js';

const JWT_SECRET = process.env.JWT_SECRET || 'aviator_secret_key_2026_super_secure';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // 1. If MongoDB is connected, find user in Mongoose DB
    if (mongoose.connection.readyState === 1) {
      try {
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
          return next();
        }
      } catch (e) {}
    }

    // 2. In-memory fallback search by id or phone or stringified _id
    if (inMemoryUsers && inMemoryUsers.size > 0) {
      for (const u of inMemoryUsers.values()) {
        const uId = (u.id || u._id || '').toString();
        if (uId === decoded.id || u.phone === decoded.id) {
          req.user = u;
          return next();
        }
      }
    }

    return res.status(401).json({ error: 'User session invalid or expired. Please login again.' });

  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Access forbidden. Admin permission required.' });
  }
};
