import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import Bet from '../models/Bet.js';
import { placeUserBet, cancelUserBet, getGameState } from '../services/gameEngine.js';

const router = express.Router();

// @route   POST /api/bets/place
// @desc    Place a bet for the upcoming game round
router.post('/place', verifyToken, async (req, res) => {
  try {
    const { amount, autoCashout } = req.body;
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Please enter a valid positive bet amount.' });
    }

    const result = await placeUserBet({
      userId: req.user._id,
      userName: req.user.fullName,
      userPhone: req.user.phone,
      amount: numericAmount,
      autoCashout: autoCashout ? parseFloat(autoCashout) : 0
    });

    res.status(201).json({
      message: 'Bet placed successfully!',
      bet: result.bet,
      newBalance: result.newBalance
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   POST /api/bets/cancel
// @desc    Cancel a bet during countdown before takeoff
router.post('/cancel', verifyToken, async (req, res) => {
  try {
    const { betId } = req.body;
    const result = await cancelUserBet({
      userId: req.user._id,
      betId
    });

    res.json({
      message: 'Bet cancelled successfully and funds refunded!',
      newBalance: result.newBalance
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/bets/my-bets
// @desc    Get current user's bet history
router.get('/my-bets', verifyToken, async (req, res) => {
  try {
    const bets = await Bet.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ bets });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bet history.' });
  }
});

// @route   GET /api/bets/leaderboard
// @desc    Get top wins leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const topWins = await Bet.find({ status: 'cashed_out' })
      .sort({ winAmount: -1 })
      .limit(20);
    res.json({ topWins });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
});

export default router;
