import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { LeaveBalance } from '../models/LeaveBalance';
import { hashPassword } from '../utils/password';

async function seedRH() {
  await connectDB();

  const email = 'rh@supherman.com';
  const existing = await User.findOne({ email });

  if (existing) {
    console.log('Le compte RH existe déjà, rien à faire.');
  } else {
    const user = await User.create({
      firstName: 'Responsable',
      lastName: 'RH',
      email,
      password: await hashPassword('Suph3rm4n!'),
      role: 'hr',
      isActive: true,
      mustSetPassword: false,
    });
    await LeaveBalance.create({ user: user._id, year: new Date().getFullYear() });
    console.log('Compte RH créé : rh@supherman.com');
  }

  await mongoose.disconnect();
  process.exit(0);
}

seedRH().catch((err) => {
  console.error('Seed échoué :', err);
  process.exit(1);
});