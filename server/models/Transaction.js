import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userPhone: {
    type: String
  },
  userName: {
    type: String
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal'],
    required: true
  },
  method: {
    type: String,
    enum: ['mpesa', 'usdt'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'rejected', 'failed'],
    default: 'pending'
  },
  phone: {
    type: String
  },
  usdtAddress: {
    type: String
  },
  txHash: {
    type: String
  },
  checkoutRequestId: {
    type: String
  },
  mpesaReceipt: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Transaction', transactionSchema);
