import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { User } from '@/server/entities/User';
import { Deposit } from '@/server/entities/Deposit';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();
    const userRepository = AppDataSource.getRepository(User);
    const depositRepository = AppDataSource.getRepository(Deposit);

    const user = await userRepository.findOne({ where: { id: decoded.userId } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const depositHistory = await depositRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' }
    });

    return NextResponse.json({ 
      walletBalance: user.walletBalance,
      depositHistory 
    }, { status: 200 });

  } catch (error) {
    console.error('Wallet API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
