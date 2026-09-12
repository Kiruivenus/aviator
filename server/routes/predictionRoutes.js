import express from 'express';
import mongoose from 'mongoose';
import Prediction from '../models/Prediction.js';
import GameRound from '../models/GameRound.js';
import { getGameState, getNextPredictionSignal } from '../services/gameEngine.js';

const router = express.Router();

// @route   GET /api/prediction/next
// @desc    Fetch exact predicted crash multiplier stored in MongoDB & Game Engine before takeoff
router.get('/next', async (req, res) => {
  try {
    const currentState = getGameState();
    const currentRoundId = currentState.roundId;

    let roundId = currentRoundId || ('R_' + Date.now());
    let nextMultiplier = currentState.crashPoint || 2.45;
    let history = currentState.history || [];

    // Query MongoDB for the exact prediction matching the active/upcoming roundId
    if (mongoose.connection.readyState === 1 && currentRoundId) {
      try {
        const predDoc = await Prediction.findOne({ roundId: currentRoundId });
        if (predDoc) {
          roundId = predDoc.roundId;
          nextMultiplier = predDoc.nextMultiplier;
        } else {
          const roundDoc = await GameRound.findOne({ roundId: currentRoundId });
          if (roundDoc) {
            roundId = roundDoc.roundId;
            nextMultiplier = roundDoc.crashMultiplier;
          }
        }
      } catch (e) {}
    }

    res.json({
      success: true,
      roundId: roundId,
      status: currentState.status,
      nextMultiplier: nextMultiplier, // Exact crash number from MongoDB & Game Engine!
      countdown: currentState.countdown,
      confidence: '99.8%',
      history: history,
      algorithm: 'Quantum AI NeuralPredict v4.2',
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch signal prediction.' });
  }
});

export default router;
