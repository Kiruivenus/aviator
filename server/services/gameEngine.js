import mongoose from 'mongoose';
import GameRound from '../models/GameRound.js';
import Prediction from '../models/Prediction.js';
import Bet from '../models/Bet.js';
import User from '../models/User.js';
import { inMemoryUsers } from '../routes/authRoutes.js';

let ioInstance = null;

// Safe helper for user lookup in DB or in-memory fallback
const findUserByIdOrInMemory = async (userId) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const dbUser = await User.findById(userId);
      if (dbUser) return dbUser;
    } catch (err) {
      // Mongoose CastError or invalid ObjectId string
    }
  }

  if (inMemoryUsers) {
    for (let u of inMemoryUsers.values()) {
      if (u.id === userId || u._id === userId || u.phone === userId) {
        return u;
      }
    }
  }

  return null;
};

// Generate random crash point with typical house edge distribution
const generateCrashPoint = () => {
  const e = 100;
  const r = Math.floor(Math.random() * e);
  // 3% instant crash at 1.00x
  if (r < 3) return 1.00;
  
  const rand = Math.random();
  // Multiplier formula: 0.97 / (1 - rand)
  let raw = 0.97 / (1 - rand);
  // Cap max multiplier for stability
  if (raw > 200) raw = 200;
  return parseFloat(raw.toFixed(2));
};

// In-Memory state for high-frequency game ticks
let gameState = {
  roundId: 'R_' + Date.now(),
  status: 'waiting', // waiting, running, crashed
  multiplier: 1.00,
  crashPoint: 2.00,
  countdown: 10,
  activeBets: [],
  history: [4.36, 1.08, 6.70, 2.02, 1.93, 4.11, 1.00, 3.67, 4.12, 1.53, 5.88, 1.78, 1.54, 12.87, 1.42, 1.75, 4.03, 1.66]
};

export const initGameEngine = (io) => {
  ioInstance = io;
  console.log('Initializing Aviator Game Loop Engine with MongoDB Pre-Fetched Predictions...');

  startNewRound();

  io.on('connection', (socket) => {
    // Send current state and exact prediction to newly connected client
    socket.emit('game_state', {
      roundId: gameState.roundId,
      status: gameState.status,
      multiplier: gameState.multiplier,
      countdown: gameState.countdown,
      activeBets: gameState.activeBets,
      history: gameState.history
    });

    socket.emit('prediction_update', {
      roundId: gameState.roundId,
      currentRoundId: gameState.roundId,
      status: gameState.status,
      nextMultiplier: gameState.crashPoint,
      history: gameState.history
    });

    // Handle Manual Cashout Request
    socket.on('cash_out', async (data) => {
      try {
        const { userId, betId } = data;
        if (gameState.status !== 'running') {
          return socket.emit('cash_out_error', { message: 'Round is not currently active.' });
        }

        const bet = gameState.activeBets.find((b) => b.id === betId || (b.userId === userId && b.status === 'active'));
        if (!bet || bet.status !== 'active') {
          return socket.emit('cash_out_error', { message: 'No active bet found to cash out.' });
        }

        const winMultiplier = gameState.multiplier;
        const winAmount = parseFloat((bet.amount * winMultiplier).toFixed(2));

        bet.status = 'cashed_out';
        bet.cashoutMultiplier = winMultiplier;
        bet.winAmount = winAmount;

        const user = await findUserByIdOrInMemory(userId);
        if (user) {
          user.balance += winAmount;
          if (user.save && typeof user.save === 'function') {
            try { await user.save(); } catch (e) {}
          }
        }

        if (mongoose.connection.readyState === 1) {
          try {
            await Bet.findByIdAndUpdate(bet.dbId || bet.id, {
              status: 'cashed_out',
              cashoutMultiplier: winMultiplier,
              winAmount: winAmount
            });
          } catch (e) {}
        }

        socket.emit('cash_out_success', {
          betId: bet.id,
          winAmount: winAmount,
          multiplier: winMultiplier,
          newBalance: user ? user.balance : 0
        });

        ioInstance?.emit('bet_cashed_out', {
          betId: bet.id,
          userId: userId,
          multiplier: winMultiplier,
          winAmount: winAmount
        });

      } catch (err) {
        console.error('Cashout error:', err.message);
        socket.emit('cash_out_error', { message: 'Internal error processing cashout.' });
      }
    });

    // Handle Bet Cancel Request (Before flight takeoff)
    socket.on('cancel_bet', async (data) => {
      try {
        const { userId, betId } = data;
        const result = await cancelUserBet({ userId, betId });
        socket.emit('cancel_bet_success', {
          betId,
          newBalance: result.newBalance
        });
      } catch (err) {
        socket.emit('cancel_bet_error', { message: err.message });
      }
    });
  });
};

// Start a fresh round
const startNewRound = async () => {
  // Generate EXACT crash point & round ID for this upcoming flight
  gameState.roundId = 'R_' + Date.now();
  gameState.crashPoint = generateCrashPoint();
  gameState.status = 'waiting';
  gameState.multiplier = 1.00;
  gameState.countdown = 10;
  gameState.activeBets = [];

  // Seed bot players to populate active list
  seedBotBets();

  // Save to MongoDB BEFORE flight begins so predictor can pre-fetch exact crash multiplier
  if (mongoose.connection.readyState === 1) {
    try {
      await GameRound.create({
        roundId: gameState.roundId,
        crashMultiplier: gameState.crashPoint,
        status: 'waiting'
      });

      await Prediction.create({
        roundId: gameState.roundId,
        nextMultiplier: gameState.crashPoint,
        status: 'pending'
      });
    } catch (err) {
      console.error('MongoDB save round error:', err.message);
    }
  }

  // Broadcast waiting state and exact pre-fetched prediction to all clients BEFORE flight takeoff
  ioInstance?.emit('round_waiting', {
    roundId: gameState.roundId,
    countdown: gameState.countdown,
    activeBets: gameState.activeBets,
    history: gameState.history
  });

  ioInstance?.emit('prediction_update', {
    roundId: gameState.roundId,
    currentRoundId: gameState.roundId,
    status: gameState.status,
    nextMultiplier: gameState.crashPoint,
    history: gameState.history
  });

  // Countdown timer phase (10s)
  const timer = setInterval(() => {
    gameState.countdown -= 1;
    ioInstance?.emit('countdown_tick', { countdown: gameState.countdown });

    if (gameState.countdown <= 0) {
      clearInterval(timer);
      runFlightPhase();
    }
  }, 1000);
};

// Flight Phase: Multiplier ticks up dynamically
const runFlightPhase = async () => {
  gameState.status = 'running';
  let startTime = Date.now();

  if (mongoose.connection.readyState === 1) {
    try {
      await GameRound.findOneAndUpdate({ roundId: gameState.roundId }, { status: 'running' });
      await Prediction.findOneAndUpdate({ roundId: gameState.roundId }, { status: 'active' });
    } catch (e) {}
  }

  ioInstance?.emit('round_started', {
    roundId: gameState.roundId,
    crashPoint: gameState.crashPoint
  });

  ioInstance?.emit('prediction_update', {
    roundId: gameState.roundId,
    currentRoundId: gameState.roundId,
    status: gameState.status,
    nextMultiplier: gameState.crashPoint,
    history: gameState.history
  });

  const flightInterval = setInterval(async () => {
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    let currentMult = parseFloat((1.00 * Math.exp(0.06 * elapsedSeconds * 1.5)).toFixed(2));

    if (currentMult >= gameState.crashPoint) {
      currentMult = gameState.crashPoint;
      gameState.multiplier = currentMult;
      clearInterval(flightInterval);
      await endRoundCrash();
      return;
    }

    gameState.multiplier = currentMult;
    ioInstance?.emit('multiplier_tick', { multiplier: currentMult });

    // Check auto-cashouts
    for (let bet of gameState.activeBets) {
      if (bet.status === 'active' && bet.autoCashout > 1.00 && currentMult >= bet.autoCashout) {
        bet.status = 'cashed_out';
        bet.cashoutMultiplier = currentMult;
        bet.winAmount = parseFloat((bet.amount * currentMult).toFixed(2));

        const user = await findUserByIdOrInMemory(bet.userId);
        if (user) {
          user.balance += bet.winAmount;
          if (user.save && typeof user.save === 'function') {
            try { await user.save(); } catch (e) {}
          }
        }

        if (mongoose.connection.readyState === 1) {
          try {
            await Bet.findByIdAndUpdate(bet.dbId || bet.id, {
              status: 'cashed_out',
              cashoutMultiplier: currentMult,
              winAmount: bet.winAmount
            });
          } catch (e) {}
        }

        ioInstance?.emit('bet_cashed_out', {
          betId: bet.id,
          userId: bet.userId,
          multiplier: currentMult,
          winAmount: bet.winAmount
        });
      }
    }
  }, 100);
};

// Round Crashed Handler
const endRoundCrash = async () => {
  gameState.status = 'crashed';
  
  for (let bet of gameState.activeBets) {
    if (bet.status === 'active') {
      bet.status = 'lost';
      if (mongoose.connection.readyState === 1) {
        try {
          await Bet.findByIdAndUpdate(bet.dbId || bet.id, { status: 'lost' });
        } catch (e) {}
      }
    }
  }

  // Prepend crash multiplier to history bar
  gameState.history.unshift(gameState.crashPoint);
  if (gameState.history.length > 20) gameState.history.pop();

  if (mongoose.connection.readyState === 1) {
    try {
      await GameRound.findOneAndUpdate(
        { roundId: gameState.roundId },
        { status: 'crashed', crashedAt: new Date() }
      );
      await Prediction.findOneAndUpdate(
        { roundId: gameState.roundId },
        { status: 'completed' }
      );
    } catch (e) {}
  }

  ioInstance?.emit('round_crashed', {
    roundId: gameState.roundId,
    crashPoint: gameState.crashPoint,
    history: gameState.history
  });

  // Pause for 3.5 seconds before next round
  setTimeout(() => {
    startNewRound();
  }, 3500);
};

const seedBotBets = () => {
  const botNames = ['T***o', 'A***n', '2***3', 'M***n', 'L***y', '2***2', '1***9', '2***7', 'S***r', 'V***x', 'K***l'];
  const count = Math.floor(Math.random() * 5) + 6;
  for (let i = 0; i < count; i++) {
    const name = botNames[i % botNames.length];
    const amount = Math.floor(Math.random() * 4000) + 200;
    gameState.activeBets.push({
      id: 'bot_' + Math.random().toString(36).substr(2, 9),
      userId: 'bot_id_' + i,
      userName: name,
      userPhone: name,
      amount: amount,
      autoCashout: Math.random() > 0.4 ? parseFloat((Math.random() * 3 + 1.2).toFixed(2)) : 0,
      status: 'active',
      winAmount: 0,
      cashoutMultiplier: 0
    });
  }
};

export const getGameState = () => gameState;

export const getNextPredictionSignal = async () => {
  let predSignal = {
    roundId: gameState.roundId,
    currentRoundId: gameState.roundId,
    status: gameState.status,
    nextMultiplier: gameState.crashPoint,
    history: gameState.history
  };

  if (mongoose.connection.readyState === 1 && gameState.roundId) {
    try {
      const predDoc = await Prediction.findOne({ roundId: gameState.roundId });
      if (predDoc) {
        predSignal.nextMultiplier = predDoc.nextMultiplier;
      }
    } catch (e) {}
  }

  return predSignal;
};

export const placeUserBet = async ({ userId, userName, userPhone, amount, autoCashout }) => {
  if (gameState.status !== 'waiting') {
    throw new Error('Bets can only be placed during the countdown phase before flight takeoff.');
  }

  let user = await findUserByIdOrInMemory(userId);
  if (!user && userPhone) {
    user = await findUserByIdOrInMemory(userPhone);
  }

  if (!user) {
    user = { id: userId, balance: 0, save: async () => {} };
  }

  if (user.balance < amount) {
    throw new Error('Insufficient balance to place bet.');
  }

  // Deduct balance
  user.balance -= amount;
  if (user.save && typeof user.save === 'function') {
    try { await user.save(); } catch (e) {}
  }

  const betObj = {
    id: 'bet_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    userId: userId,
    userName: userName || user.fullName || 'Player',
    userPhone: userPhone || user.phone || '',
    amount: amount,
    autoCashout: autoCashout || 0,
    status: 'active',
    winAmount: 0,
    cashoutMultiplier: 0
  };

  if (mongoose.connection.readyState === 1) {
    try {
      const betDoc = new Bet({
        userId: userId,
        roundId: gameState.roundId,
        amount: amount,
        autoCashout: autoCashout || 0,
        status: 'active'
      });
      await betDoc.save();
      betObj.dbId = betDoc._id.toString();
    } catch (dbErr) {}
  }

  gameState.activeBets.push(betObj);

  ioInstance?.emit('bet_placed', {
    bet: betObj,
    activeBets: gameState.activeBets
  });

  return {
    success: true,
    bet: betObj,
    newBalance: user.balance
  };
};

export const cancelUserBet = async ({ userId, betId }) => {
  if (gameState.status !== 'waiting') {
    throw new Error('Bets can only be cancelled during the countdown phase before flight takeoff.');
  }

  const betIndex = gameState.activeBets.findIndex(
    (b) => (betId && b.id === betId) || (b.userId === userId && b.status === 'active')
  );

  if (betIndex === -1) {
    throw new Error('Active bet not found to cancel.');
  }

  const bet = gameState.activeBets[betIndex];

  // Remove from active bets array
  gameState.activeBets.splice(betIndex, 1);

  // Refund user balance
  let user = await findUserByIdOrInMemory(userId);
  if (user) {
    user.balance += bet.amount;
    if (user.save && typeof user.save === 'function') {
      try { await user.save(); } catch (e) {}
    }
  }

  // Update DB record if exists
  if (mongoose.connection.readyState === 1) {
    try {
      await Bet.findByIdAndUpdate(bet.dbId || bet.id, { status: 'cancelled' });
    } catch (e) {}
  }

  // Broadcast socket updates
  ioInstance?.emit('bet_cancelled', {
    betId: bet.id,
    userId: userId,
    activeBets: gameState.activeBets,
    newBalance: user ? user.balance : undefined
  });

  return {
    success: true,
    cancelledBetId: bet.id,
    newBalance: user ? user.balance : 0
  };
};
