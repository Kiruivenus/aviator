import mongoose from 'mongoose';

const betSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String
  },
  userPhone: {
    type: String
  },
  roundId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  autoCashout: {
    type: Number,
    default: 0
  },
  cashoutMultiplier: {
    type: Number,
    default: 0
  },
  winAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'cashed_out', 'lost'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Bet', betSchema);
