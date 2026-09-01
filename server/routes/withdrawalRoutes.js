import express from 'express';
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

    if (isNaN(numericAmount) || numericAmount < 100) {
      return res.status(400).json({ error: 'Minimum withdrawal amount is KES 100.' });
    }

    if (!['mpesa', 'usdt'].includes(method)) {
      return res.status(400).json({ error: 'Invalid withdrawal method selected.' });
    }

    if (method === 'mpesa' && !phone) {
      return res.status(400).json({ error: 'Please enter the M-Pesa phone number for withdrawal.' });
    }

    if (method === 'usdt' && (!usdtAddress || usdtAddress.trim().length < 10)) {
      return res.status(400).json({ error: 'Please enter a valid USDT TRC20 wallet address.' });
    }

    const user = await User.findById(req.user._id);
    if (!user || user.balance < numericAmount) {
      return res.status(400).json({ error: 'Insufficient wallet balance for this withdrawal.' });
    }

    // Deduct user balance pending admin processing
    user.balance -= numericAmount;
    await user.save();

    const tx = new Transaction({
      userId: user._id,
      userPhone: user.phone,
      userName: user.fullName,
      type: 'withdrawal',
      method,
      amount: numericAmount,
      phone: method === 'mpesa' ? phone : undefined,
      usdtAddress: method === 'usdt' ? usdtAddress.trim() : undefined,
      status: 'pending'
    });

    await tx.save();

    res.status(201).json({
      message: 'Withdrawal request submitted successfully! Pending admin approval.',
      newBalance: user.balance,
      transaction: tx
    });

  } catch (error) {
    console.error('Withdrawal error:', error.message);
    res.status(500).json({ error: 'Failed to process withdrawal request.' });
  }
});

// @route   GET /api/withdrawal/my-withdrawals
// @desc    Get logged in user's withdrawal transactions
router.get('/my-withdrawals', verifyToken, async (req, res) => {
  try {
    const withdrawals = await Transaction.find({ userId: req.user._id, type: 'withdrawal' })
      .sort({ createdAt: -1 });
    res.json({ withdrawals });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch withdrawal history.' });
  }
});

export default router;
