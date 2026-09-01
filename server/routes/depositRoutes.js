import express from 'express';
import mongoose from 'mongoose';
import { verifyToken } from '../middleware/auth.js';
import Transaction from '../models/Transaction.js';
import Setting from '../models/Setting.js';
import User from '../models/User.js';
import { initiateSTKPush } from '../services/daraja.js';
import { inMemoryUsers } from './authRoutes.js';

const router = express.Router();

// In-memory transactions cache for fallback
export const inMemoryTransactions = new Map();

// Helper to credit user balance safely
const creditUserBalance = async (userId, userPhone, amount) => {
  let creditedBalance = null;

  // DB Path
  if (mongoose.connection.readyState === 1) {
    try {
      const userDoc = await User.findById(userId);
      if (userDoc) {
        userDoc.balance += amount;
        await userDoc.save();
        creditedBalance = userDoc.balance;
      }
    } catch (e) {}
  }

  // In-Memory Path
  if (inMemoryUsers) {
    for (let u of inMemoryUsers.values()) {
      if (u.id === userId || u._id === userId || u.phone === userPhone) {
        u.balance = (u.balance || 0) + amount;
        if (creditedBalance === null) creditedBalance = u.balance;
      }
    }
  }

  return creditedBalance;
};

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
// @desc    Initiate M-Pesa STK Push deposit
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

    const txId = 'tx_dep_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    let checkoutReqId = stkResponse.CheckoutRequestID || txId;

    const txRecord = {
      _id: txId,
      id: txId,
      userId: req.user._id || req.user.id,
      userPhone: req.user.phone,
      userName: req.user.fullName,
      type: 'deposit',
      method: 'mpesa',
      amount: numericAmount,
      phone: mpesaPhone,
      checkoutRequestId: checkoutReqId,
      status: 'pending',
      createdAt: new Date()
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const txDoc = new Transaction({
          userId: req.user._id,
          userPhone: req.user.phone,
          userName: req.user.fullName,
          type: 'deposit',
          method: 'mpesa',
          amount: numericAmount,
          phone: mpesaPhone,
          checkoutRequestId: checkoutReqId,
          status: 'pending'
        });
        await txDoc.save();
        txRecord._id = txDoc._id.toString();
        txRecord.id = txDoc._id.toString();
      } catch (dbErr) {}
    }

    inMemoryTransactions.set(txRecord.id, txRecord);
    inMemoryTransactions.set(checkoutReqId, txRecord);

    // If in test/simulated mode or missing Daraja production keys, automatically confirm STK push after 4s
    if (stkResponse.simulated || !process.env.DARAJA_CONSUMER_KEY) {
      setTimeout(async () => {
        txRecord.status = 'completed';

        if (mongoose.connection.readyState === 1) {
          try {
            await Transaction.findByIdAndUpdate(txRecord._id, { status: 'completed' });
          } catch (e) {}
        }

        const newBal = await creditUserBalance(txRecord.userId, txRecord.userPhone, numericAmount);
        if (req.user) req.user.balance = newBal !== null ? newBal : (req.user.balance + numericAmount);
      }, 4000);
    }

    res.json({
      message: `STK Push prompt sent to ${mpesaPhone}! Please enter your M-Pesa PIN on your mobile phone to complete payment.`,
      transactionId: txRecord.id,
      checkoutRequestId: checkoutReqId,
      status: 'pending',
      simulated: stkResponse.simulated
    });

  } catch (error) {
    console.error('M-Pesa STK error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to trigger M-Pesa STK Push.' });
  }
});

// @route   GET /api/deposit/status/:txId
// @desc    Poll status of an initiated deposit transaction
router.get('/status/:txId', verifyToken, async (req, res) => {
  try {
    const { txId } = req.params;

    let tx = null;
    if (mongoose.connection.readyState === 1) {
      try {
        tx = await Transaction.findOne({
          $or: [{ _id: mongoose.Types.ObjectId.isValid(txId) ? txId : null }, { checkoutRequestId: txId }]
        });
      } catch (e) {}
    }

    if (!tx) {
      tx = inMemoryTransactions.get(txId);
    }

    if (!tx) {
      return res.status(404).json({ error: 'Transaction record not found.' });
    }

    // Get current user's updated balance
    let currentBalance = req.user?.balance || 0;
    if (mongoose.connection.readyState === 1 && req.user?._id) {
      try {
        const u = await User.findById(req.user._id);
        if (u) currentBalance = u.balance;
      } catch (e) {}
    }

    res.json({
      transactionId: tx._id || tx.id,
      status: tx.status,
      amount: tx.amount,
      newBalance: currentBalance
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deposit status.' });
  }
});

// @route   POST /api/deposit/mpesa-callback
// @desc    Receive Safaricom Daraja STK Push Callback Webhook
router.post('/mpesa-callback', async (req, res) => {
  try {
    console.log('[M-Pesa Callback Received]', JSON.stringify(req.body));
    const callbackData = req.body?.Body?.stkCallback;

    if (callbackData) {
      const checkoutReqId = callbackData.CheckoutRequestID;
      const resultCode = callbackData.ResultCode;

      let tx = null;
      if (mongoose.connection.readyState === 1) {
        tx = await Transaction.findOne({ checkoutRequestId: checkoutReqId });
      }
      if (!tx) tx = inMemoryTransactions.get(checkoutReqId);

      if (tx) {
        if (resultCode === 0) {
          tx.status = 'completed';
          if (mongoose.connection.readyState === 1) {
            await Transaction.findByIdAndUpdate(tx._id, { status: 'completed' });
          }
          await creditUserBalance(tx.userId, tx.userPhone, tx.amount);
        } else {
          tx.status = 'failed';
          if (mongoose.connection.readyState === 1) {
            await Transaction.findByIdAndUpdate(tx._id, { status: 'failed' });
          }
        }
      }
    }

    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('Callback error:', error.message);
    res.json({ ResultCode: 0, ResultDesc: 'Accepted with warning' });
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
    
    const userDeposits = Array.from(inMemoryTransactions.values())
      .filter(t => t.userId === (req.user._id || req.user.id) && t.type === 'deposit')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ deposits: userDeposits });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deposits history.' });
  }
});

export default router;
