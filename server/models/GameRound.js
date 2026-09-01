import mongoose from 'mongoose';

const gameRoundSchema = new mongoose.Schema({
  roundId: {
    type: String,
    required: true,
    unique: true
  },
  crashMultiplier: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'running', 'crashed'],
    default: 'waiting'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  crashedAt: {
    type: Date
  }
});

export default mongoose.model('GameRound', gameRoundSchema);
