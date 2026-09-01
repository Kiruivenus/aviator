import express from 'express';
import mongoose from 'mongoose';
import { verifyToken } from '../middleware/auth.js';
import Transaction from '../models/Transaction.js';
import Setting from '../models/Setting.js';
import User from '../models/User.js';
import { initiateSTKPush } from '../services/daraja.js';
import { inMemoryUsers } from './authRoutes.js';

const router = express.Router();

// @route   GET /api/deposit/usdt-address
router.get('/usdt-address', async (req, res) => {
  try {
    let address = 'T9x2PzQ1K9aM8bC3dE4fG5hJ6kL7mN8pQ9';
    if (mongoose.connection.readyState === 1) {
      const setting = await Setting.findOne({ key: 'usdt_trc20_address' });
      if (setting) address = setting.value;
    }
    res.json({ usdtAddress: address });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch USDT TRC20 address.' });
  }
});

// @route   POST /api/deposit/mpesa-stk
router.post('/mpesa-stk', verifyToken, async (req, res) => {
  try {
    const { phone, amount } = req.body;
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount < 10) {
      return res.status(400).json({ error: 'Minimum deposit amount is KES 10.' });
    }

    const mpesaPhone = phone || req.user.phone;

    // Call Daraja service simulator / API
    const stkResponse = await initiateSTKPush(mpesaPhone, numericAmount);

    let newBal = req.user.balance;

    if (mongoose.connection.readyState === 1) {
      try {
        const tx = new Transaction({
          userId: req.user._id,
          userPhone: req.user.phone,
          userName: req.user.fullName,
          type: 'deposit',
          method: 'mpesa',
          amount: numericAmount,
          phone: mpesaPhone,
          checkoutRequestId: stkResponse.CheckoutRequestID,
          status: stkResponse.simulated ? 'completed' : 'pending'
        });
        await tx.save();

        if (stkResponse.simulated) {
          const userDoc = await User.findById(req.user._id);
          if (userDoc) {
            userDoc.balance += numericAmount;
            await userDoc.save();
            newBal = userDoc.balance;
          }
        }
      } catch (dbErr) {
        // Fallback for non-ObjectId user
      }
    }

    if (stkResponse.simulated) {
      req.user.balance += numericAmount;
      newBal = req.user.balance;
    }

    res.json({
      message: stkResponse.CustomerMessage || 'STK Push sent to phone. Enter M-Pesa PIN to complete.',
      checkoutRequestId: stkResponse.CheckoutRequestID,
      simulated: stkResponse.simulated,
      newBalance: newBal
    });

  } catch (error) {
    console.error('M-Pesa STK error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to trigger M-Pesa STK Push.' });
  }
});

// @route   GET /api/deposit/my-deposits
router.get('/my-deposits', verifyToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        const deposits = await Transaction.find({ userId: req.user._id, type: 'deposit' })
          .sort({ createdAt: -1 });
        return res.json({ deposits });
      } catch (e) {}
    }
    
    // In-memory dummy list if offline
    res.json({
      deposits: [
        { _id: 'tx_dep_1', amount: 500, type: 'Deposit', method: 'mpesa', status: 'completed', createdAt: new Date() }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deposits history.' });
  }
});

export default router;
