import express from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import Setting from '../models/Setting.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Bet from '../models/Bet.js';

const router = express.Router();

// Apply auth & admin middleware to all routes in this file
router.use(verifyToken, isAdmin);

// @route   GET /api/admin/stats
// @desc    Get Admin dashboard overview metrics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const pendingDeposits = await Transaction.countDocuments({ type: 'deposit', status: 'pending' });
    const pendingWithdrawals = await Transaction.countDocuments({ type: 'withdrawal', status: 'pending' });
    const totalBetsCount = await Bet.countDocuments();
    
    const settings = await Setting.find();
    const usdtAddrSetting = settings.find(s => s.key === 'usdt_trc20_address');

    res.json({
      stats: {
        totalUsers,
        pendingDeposits,
        pendingWithdrawals,
        totalBetsCount
      },
      usdtAddress: usdtAddrSetting ? usdtAddrSetting.value : 'T9x2PzQ1K9aM8bC3dE4fG5hJ6kL7mN8pQ9'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin dashboard statistics.' });
  }
});

// @route   PUT /api/admin/settings/usdt
// @desc    Update USDT TRC20 Deposit Address
router.put('/settings/usdt', async (req, res) => {
  try {
    const { address } = req.body;
    if (!address || address.trim().length < 10) {
      return res.status(400).json({ error: 'Please enter a valid USDT TRC20 address.' });
    }

    const updated = await Setting.findOneAndUpdate(
      { key: 'usdt_trc20_address' },
      { value: address.trim(), updatedAt: new Date() },
      { new: true, upsert: true }
    );

    res.json({
      message: 'USDT TRC20 Deposit Address updated successfully!',
      setting: updated
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update USDT address.' });
  }
});

// @route   GET /api/admin/users
// @desc    Get list of all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users list.' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user role or balance
router.put('/users/:id', async (req, res) => {
  try {
    const { role, balance } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (role && ['user', 'admin'].includes(role)) {
      user.role = role;
    }
    if (balance !== undefined && !isNaN(parseFloat(balance))) {
      user.balance = parseFloat(balance);
    }

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        balance: user.balance
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

// @route   GET /api/admin/transactions
// @desc    Get list of all transactions with optional filter
router.get('/transactions', async (req, res) => {
  try {
    const { type, status } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const transactions = await Transaction.find(filter).sort({ createdAt: -1 });
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions.' });
  }
});

// @route   PUT /api/admin/transactions/:id
// @desc    Approve or Reject transaction (Deposit or Withdrawal)
router.put('/transactions/:id', async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be approve or reject.' });
    }

    const tx = await Transaction.findById(req.params.id);
    if (!tx) {
      return res.status(404).json({ error: 'Transaction record not found.' });
    }

    if (tx.status !== 'pending') {
      return res.status(400).json({ error: `Transaction is already ${tx.status}.` });
    }

    const user = await User.findById(tx.userId);

    if (action === 'approve') {
      tx.status = 'completed';
      if (tx.type === 'deposit') {
        // Credit user balance for approved deposit
        if (user) {
          user.balance += tx.amount;
          await user.save();
        }
      }
    } else if (action === 'reject') {
      tx.status = 'rejected';
      if (tx.type === 'withdrawal') {
        // Refund reserved balance for rejected withdrawal
        if (user) {
          user.balance += tx.amount;
          await user.save();
        }
      }
    }

    await tx.save();

    res.json({
      message: `Transaction ${action}d successfully.`,
      transaction: tx
    });

  } catch (error) {
    console.error('Admin transaction action error:', error.message);
    res.status(500).json({ error: 'Failed to update transaction status.' });
  }
});

export default router;
