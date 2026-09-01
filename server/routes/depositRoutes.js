import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import Transaction from '../models/Transaction.js';
import Setting from '../models/Setting.js';
import User from '../models/User.js';
import { initiateSTKPush } from '../services/daraja.js';

const router = express.Router();

// @route   GET /api/deposit/usdt-address
// @desc    Get dynamic USDT TRC20 address configured by admin
router.get('/usdt-address', async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'usdt_trc20_address' });
    const address = setting ? setting.value : 'T9x2PzQ1K9aM8bC3dE4fG5hJ6kL7mN8pQ9';
    res.json({ usdtAddress: address });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch USDT TRC20 address.' });
  }
});

// @route   POST /api/deposit/mpesa-stk
// @desc    Trigger M-Pesa STK Push top-up via Daraja
router.post('/mpesa-stk', verifyToken, async (req, res) => {
  try {
    const { phone, amount } = req.body;
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount < 10) {
      return res.status(400).json({ error: 'Minimum deposit amount is KES 10.' });
    }

    const mpesaPhone = phone || req.user.phone;

    // Call Daraja service
    const stkResponse = await initiateSTKPush(mpesaPhone, numericAmount);

    // Create pending transaction in DB
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

    // If simulator mode was used, credit user balance immediately for smooth testing
    if (stkResponse.simulated) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.balance += numericAmount;
        await user.save();
      }
    }

    res.json({
      message: stkResponse.CustomerMessage || 'STK Push sent to phone. Enter M-Pesa PIN to complete.',
      checkoutRequestId: stkResponse.CheckoutRequestID,
      simulated: stkResponse.simulated,
      newBalance: stkResponse.simulated ? (req.user.balance + numericAmount) : req.user.balance
    });

  } catch (error) {
    console.error('M-Pesa STK error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to trigger M-Pesa STK Push.' });
  }
});

// @route   POST /api/deposit/mpesa-callback
// @desc    M-Pesa Daraja callback webhook endpoint
router.post('/mpesa-callback', async (req, res) => {
  try {
    const body = req.body?.Body?.stkCallback;
    if (!body) {
      return res.status(400).json({ error: 'Invalid callback payload' });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = body;

    const tx = await Transaction.findOne({ checkoutRequestId: CheckoutRequestID });
    if (!tx) {
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    if (ResultCode === 0) {
      // Payment Successful
      let mpesaReceipt = '';
      if (CallbackMetadata?.Item) {
        const receiptObj = CallbackMetadata.Item.find(item => item.Name === 'MpesaReceiptNumber');
        if (receiptObj) mpesaReceipt = receiptObj.Value;
      }

      tx.status = 'completed';
      tx.mpesaReceipt = mpesaReceipt;
      await tx.save();

      // Credit User Balance
      const user = await User.findById(tx.userId);
      if (user) {
        user.balance += tx.amount;
        await user.save();
      }
    } else {
      // Payment failed or cancelled by user
      tx.status = 'failed';
      await tx.save();
    }

    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('M-Pesa callback error:', error.message);
    res.status(500).json({ error: 'Callback processing error' });
  }
});

// @route   POST /api/deposit/usdt-submit
// @desc    Submit USDT TRC20 deposit transaction hash for admin verification
router.post('/usdt-submit', verifyToken, async (req, res) => {
  try {
    const { amount, txHash } = req.body;
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount < 1) {
      return res.status(400).json({ error: 'Please enter a valid deposit amount.' });
    }

    if (!txHash || txHash.trim().length < 10) {
      return res.status(400).json({ error: 'Please enter a valid USDT TRC20 transaction hash (TxID).' });
    }

    // Get current USDT TRC20 address
    const setting = await Setting.findOne({ key: 'usdt_trc20_address' });
    const usdtAddr = setting ? setting.value : 'T9x2PzQ1K9aM8bC3dE4fG5hJ6kL7mN8pQ9';

    const tx = new Transaction({
      userId: req.user._id,
      userPhone: req.user.phone,
      userName: req.user.fullName,
      type: 'deposit',
      method: 'usdt',
      amount: numericAmount,
      usdtAddress: usdtAddr,
      txHash: txHash.trim(),
      status: 'pending'
    });

    await tx.save();

    res.status(201).json({
      message: 'USDT deposit submitted successfully! Pending admin verification.',
      transaction: tx
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit USDT deposit request.' });
  }
});

// @route   GET /api/deposit/my-deposits
// @desc    Get current user's deposit transaction history
router.get('/my-deposits', verifyToken, async (req, res) => {
  try {
    const deposits = await Transaction.find({ userId: req.user._id, type: 'deposit' })
      .sort({ createdAt: -1 });
    res.json({ deposits });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deposits history.' });
  }
});

export default router;
