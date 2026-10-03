import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { User } from '@/server/entities/User';

export async function GET(req: Request) {
  try {
    await connectDB();
    const userRepository = AppDataSource.getRepository(User);
    
    // Fetch all users with their deposits to calculate total deposited amount
    const users = await userRepository.find({
      relations: { deposits: true },
      order: {
        createdAt: 'DESC'
      }
    });

    // Remove password hashes before sending to frontend
    const safeUsers = users.map(({ passwordHash, ...user }) => user);

    return NextResponse.json({ users: safeUsers }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
