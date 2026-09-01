import GameRound from '../models/GameRound.js';
import Bet from '../models/Bet.js';
import User from '../models/User.js';

let ioInstance = null;

// In-Memory state for high-frequency game ticks
let gameState = {
  roundId: '',
  status: 'waiting', // waiting, running, crashed
  multiplier: 1.00,
  crashPoint: 1.00,
  countdown: 5,
  activeBets: [], // array of { id, userId, userName, userPhone, amount, autoCashout, status, winAmount, cashoutMultiplier }
  history: [4.36, 1.08, 6.70, 2.02, 1.93, 4.11, 1.00, 3.67, 4.12, 1.53, 5.88, 1.78, 1.54, 12.87, 1.42, 1.75, 4.03, 1.66]
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

export const initGameEngine = (io) => {
  ioInstance = io;
  console.log('Initializing Aviator Game Loop Engine...');

  startNewRound();

  io.on('connection', (socket) => {
    // Send current state to newly connected client
    socket.emit('game_state', {
      roundId: gameState.roundId,
      status: gameState.status,
      multiplier: gameState.multiplier,
      countdown: gameState.countdown,
      activeBets: gameState.activeBets,
      history: gameState.history
    });

    // Handle Manual Cashout Request
    socket.on('cash_out', async (data) => {
      try {
        const { userId, betId } = data;
        if (gameState.status !== 'running') {
          return socket.emit('cash_out_error', { message: 'Round is not currently active.' });
        }

        const betIndex = gameState.activeBets.findIndex(
          (b) => b.id === betId || (b.userId === userId && b.status === 'active')
        );

        if (betIndex === -1) {
          return socket.emit('cash_out_error', { message: 'Active bet not found.' });
        }

        const bet = gameState.activeBets[betIndex];
        if (bet.status !== 'active') {
          return socket.emit('cash_out_error', { message: 'Bet already cashed out or settled.' });
        }

        const winMultiplier = gameState.multiplier;
        const winAmount = parseFloat((bet.amount * winMultiplier).toFixed(2));

        // Update in-memory bet state
        bet.status = 'cashed_out';
        bet.cashoutMultiplier = winMultiplier;
        bet.winAmount = winAmount;

        // Credit user balance in DB
        const user = await User.findById(bet.userId);
        if (user) {
          user.balance += winAmount;
          await user.save();
        }

        // Update Bet record in DB if exists
        try {
          await Bet.findByIdAndUpdate(bet.dbId || bet.id, {
            status: 'cashed_out',
            cashoutMultiplier: winMultiplier,
            winAmount: winAmount
          });
        } catch (e) {
          // Soft catch if dbId was mock
        }

        // Broadcast bet update & cashout notification
        ioInstance.emit('bet_cashed_out', {
          betId: bet.id,
          userId: bet.userId,
          multiplier: winMultiplier,
          winAmount: winAmount,
          newBalance: user ? user.balance : undefined
        });

        socket.emit('cash_out_success', {
          betId: bet.id,
          winMultiplier,
          winAmount,
          newBalance: user ? user.balance : undefined
        });

      } catch (err) {
        console.error('Cashout error:', err.message);
        socket.emit('cash_out_error', { message: 'Internal error processing cashout.' });
      }
    });
  });
};

// Start a fresh round
const startNewRound = async () => {
  gameState.roundId = 'R_' + Date.now();
  gameState.status = 'waiting';
  gameState.multiplier = 1.00;
  gameState.crashPoint = generateCrashPoint();
  gameState.countdown = 5;
  gameState.activeBets = [];

  // Add simulated bot players to populate active list like screenshot
  seedBotBets();

  try {
    const roundDoc = new GameRound({
      roundId: gameState.roundId,
      crashMultiplier: gameState.crashPoint,
      status: 'waiting'
    });
    await roundDoc.save();
  } catch (err) {
    // DB error fallback
  }

  ioInstance?.emit('round_waiting', {
    roundId: gameState.roundId,
    countdown: gameState.countdown,
    activeBets: gameState.activeBets,
    history: gameState.history
  });

  // Countdown timer phase
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

  try {
    await GameRound.findOneAndUpdate({ roundId: gameState.roundId }, { status: 'running' });
  } catch (e) {}

  ioInstance?.emit('round_started', {
    roundId: gameState.roundId,
    crashPoint: gameState.crashPoint
  });

  const flightInterval = setInterval(async () => {
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    // Multiplier curve calculation
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

        // DB update if real user
        try {
          const user = await User.findById(bet.userId);
          if (user) {
            user.balance += bet.winAmount;
            await user.save();
          }
          await Bet.findByIdAndUpdate(bet.dbId || bet.id, {
            status: 'cashed_out',
            cashoutMultiplier: currentMult,
            winAmount: bet.winAmount
          });
        } catch (e) {}

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
  
  // Update uncashed bets to lost
  for (let bet of gameState.activeBets) {
    if (bet.status === 'active') {
      bet.status = 'lost';
      try {
        await Bet.findByIdAndUpdate(bet.dbId || bet.id, { status: 'lost' });
      } catch (e) {}
    }
  }

  // Prepend crash multiplier to history bar
  gameState.history.unshift(gameState.crashPoint);
  if (gameState.history.length > 20) gameState.history.pop();

  try {
    await GameRound.findOneAndUpdate(
      { roundId: gameState.roundId },
      { status: 'crashed', crashedAt: new Date() }
    );
  } catch (e) {}

  ioInstance?.emit('round_crashed', {
    roundId: gameState.roundId,
    crashPoint: gameState.crashPoint,
    history: gameState.history
  });

  // Pause for 3 seconds before next round
  setTimeout(() => {
    startNewRound();
  }, 3500);
};

// Helper: Add fake/simulated players to match metricwin UI active players sidebar
const seedBotBets = () => {
  const botNames = ['T***o', 'A***n', '2***3', 'M***n', 'L***y', '2***2', '1***9', '2***7', 'S***r', 'V***x', 'K***l'];
  const count = Math.floor(Math.random() * 5) + 6; // 6 to 10 bots
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

// Export getters & bet placement helper
export const getGameState = () => gameState;

export const placeUserBet = async ({ userId, userName, userPhone, amount, autoCashout }) => {
  if (gameState.status !== 'waiting') {
    throw new Error('Bets can only be placed during the countdown phase before round starts.');
  }

  const user = await User.findById(userId);
  if (!user || user.balance < amount) {
    throw new Error('Insufficient user wallet balance. Please top up your account.');
  }

  // Deduct balance
  user.balance -= amount;
  await user.save();

  // Save Bet to DB
  const betDoc = new Bet({
    userId,
    userName: userName || user.fullName,
    userPhone: userPhone || user.phone,
    roundId: gameState.roundId,
    amount,
    autoCashout: autoCashout || 0,
    status: 'active'
  });
  await betDoc.save();

  const betObject = {
    id: betDoc._id.toString(),
    dbId: betDoc._id.toString(),
    userId,
    userName: userName || user.fullName,
    userPhone: user.phone,
    amount,
    autoCashout: autoCashout || 0,
    status: 'active',
    winAmount: 0,
    cashoutMultiplier: 0
  };

  gameState.activeBets.unshift(betObject);

  ioInstance?.emit('bet_placed', {
    bet: betObject,
    activeBets: gameState.activeBets
  });

  return {
    bet: betObject,
    newBalance: user.balance
  };
};
