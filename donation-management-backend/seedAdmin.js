import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/userModel.js';

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: 'rominvaghela017@gmail.com' });
  if (existing) {
    console.log('Admin already exists.');
    process.exit();
  }

  const admin = await User.create({
    name: 'Romin Vaghela',
    email: 'rominvaghela017@gmail.com',
    password: 'admin123', // change this to whatever you want your real password to be
    role: 'Admin',
    status: 'Active',
  });

  console.log('Admin created:', admin.email);
  process.exit();
}

seed();