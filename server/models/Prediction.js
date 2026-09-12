import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema({
  roundId: {
    type: String,
    required: true,
    unique: true
  },
  nextMultiplier: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Prediction', predictionSchema);
