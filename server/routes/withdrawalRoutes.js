import express from 'express';
import mongoose from 'mongoose';
import { verifyToken } from '../middleware/auth.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

const router = express.Router();

// @route   POST /api/withdrawal/request
// @desc    Submit a withdrawal request (M-Pesa or USDT TRC20)
router.post('/request', verifyToken, async (req, res) => {
  try {
    const { method, amount, phone, usdtAddress } = req.body;
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount < 10) {
      return res.status(400).json({ error: 'Minimum withdrawal amount is KES 10.' });
    }

    let currentBal = req.user.balance || 0;
    if (currentBal < numericAmount) {
      return res.status(400).json({ error: 'Insufficient wallet balance for this withdrawal.' });
    }

    let newBal = currentBal - numericAmount;
    req.user.balance = newBal;

    if (mongoose.connection.readyState === 1) {
      try {
        const userDoc = await User.findById(req.user._id);
        if (userDoc && userDoc.balance >= numericAmount) {
          userDoc.balance -= numericAmount;
          await userDoc.save();
          newBal = userDoc.balance;

          const tx = new Transaction({
            userId: userDoc._id,
            userPhone: userDoc.phone,
            userName: userDoc.fullName,
            type: 'withdrawal',
            method,
            amount: numericAmount,
            phone: method === 'mpesa' ? phone : undefined,
            usdtAddress: method === 'usdt' ? usdtAddress?.trim() : undefined,
            status: 'pending'
          });
          await tx.save();
        }
      } catch (e) {}
    }

    res.status(201).json({
      message: 'Withdrawal request submitted successfully! Processing is automated.',
      newBalance: newBal
    });

  } catch (error) {
    console.error('Withdrawal error:', error.message);
    res.status(500).json({ error: 'Failed to process withdrawal request.' });
  }
});

// @route   GET /api/withdrawal/my-withdrawals
router.get('/my-withdrawals', verifyToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        const withdrawals = await Transaction.find({ userId: req.user._id, type: 'withdrawal' })
          .sort({ createdAt: -1 });
        return res.json({ withdrawals });
      } catch (e) {}
    }

    res.json({ withdrawals: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch withdrawal history.' });
  }
});

export default router;
