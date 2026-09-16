import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { User, UserRole } from '../models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms_db';

const defaultUsers = [
  { name: 'Admin User', email: 'admin@lms.com', role: UserRole.ADMIN },
  { name: 'Sales Exec', email: 'sales@lms.com', role: UserRole.SALES },
  { name: 'Sanction Officer', email: 'sanction@lms.com', role: UserRole.SANCTION },
  { name: 'Disbursement Exec', email: 'disbursement@lms.com', role: UserRole.DISBURSEMENT },
  { name: 'Collection Exec', email: 'collection@lms.com', role: UserRole.COLLECTION },
  { name: 'John Borrower', email: 'borrower@lms.com', role: UserRole.BORROWER },
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    await User.deleteMany({});
    console.log('Cleared existing users.');

    const defaultPassword = 'Password123!';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const usersToInsert = defaultUsers.map((user) => ({
      ...user,
      passwordHash,
    }));

    await User.insertMany(usersToInsert);

    console.log('\n--- Seed Successful ---');
    console.log('Default password for all roles: Password123!\n');
    defaultUsers.forEach((u) => console.log(`Role: ${u.role.padEnd(14)} | Email: ${u.email}`));

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
