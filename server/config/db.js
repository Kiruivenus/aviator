import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aviator_db';
    console.log(`Connecting to MongoDB at ${connStr}...`);
    await mongoose.connect(connStr);
    console.log('MongoDB Connected Successfully.');

    // Import models to seed defaults
    const User = (await import('../models/User.js')).default;
    const Setting = (await import('../models/Setting.js')).default;

    // Seed default settings if not existing
    const existingUSDT = await Setting.findOne({ key: 'usdt_trc20_address' });
    if (!existingUSDT) {
      await Setting.create({
        key: 'usdt_trc20_address',
        value: 'T9x2PzQ1K9aM8bC3dE4fG5hJ6kL7mN8pQ9',
        description: 'USDT TRC20 Deposit Address'
      });
      console.log('Seeded default USDT TRC20 address.');
    }

    // Seed default admin account if not existing
    const adminPhone = process.env.ADMIN_PHONE || '254700000000';
    const adminExists = await User.findOne({ phone: adminPhone });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10);
      await User.create({
        fullName: 'System Administrator',
        phone: adminPhone,
        password: hashedPassword,
        role: 'admin',
        balance: 100000
      });
      console.log(`Seeded default Admin user (${adminPhone} / Admin@123).`);
    }

    // Seed a demo user for quick testing
    const demoPhone = '254712345678';
    const demoExists = await User.findOne({ phone: demoPhone });
    if (!demoExists) {
      const hashedPassword = await bcrypt.hash('User@123', 10);
      await User.create({
        fullName: 'Demo Player',
        phone: demoPhone,
        password: hashedPassword,
        role: 'user',
        balance: 5000
      });
      console.log(`Seeded default Demo user (${demoPhone} / User@123).`);
    }

  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.warn('Backend will run, ensure MongoDB service is started if saving to DB.');
  }
};
