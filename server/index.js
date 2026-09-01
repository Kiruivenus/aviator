import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import { connectDB } from './config/db.js';
import { initGameEngine } from './services/gameEngine.js';

import authRoutes from './routes/authRoutes.js';
import betRoutes from './routes/betRoutes.js';
import depositRoutes from './routes/depositRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Enable CORS for client app
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io Real-time setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// API Endpoint routes
app.use('/api/auth', authRoutes);
app.use('/api/bets', betRoutes);
app.use('/api/deposit', depositRoutes);
app.use('/api/withdrawal', withdrawalRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Aviator Backend API', timestamp: new Date() });
});

// Root welcome route
app.get('/', (req, res) => {
  res.send('🚀 Aviator Backend Server is operational!');
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Initialize Game Engine with Socket.io instance
  initGameEngine(io);

  server.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🎮 Aviator Game Server running on port ${PORT}`);
    console.log(`=================================`);
  });
};

startServer();
