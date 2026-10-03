import { DataSource } from 'typeorm';
import 'pg'; // Force Webpack to bundle the pg driver for Vercel
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env if not already loaded
dotenv.config({ path: path.join(process.cwd(), '.env') });

import { User } from '../entities/User';
import { Deposit } from '../entities/Deposit';
import { Package } from '../entities/Package';
import { UserPackage } from '../entities/UserPackage';
import { Task } from '../entities/Task';
import { UserTask } from '../entities/UserTask';
import { Withdrawal } from '../entities/Withdrawal';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: true, // Auto-create tables (set to false in production)
  logging: false,
  entities: [User, Deposit, Package, UserPackage, Task, UserTask, Withdrawal],
  migrations: [],
  subscribers: [],
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false
    }
  }
});

export const connectDB = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('PostgreSQL Database connected via TypeORM successfully.');
    }
  } catch (error) {
    console.error('Error connecting to PostgreSQL database:', error);
    throw error;
  }
};
