import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { Withdrawal } from '@/server/entities/Withdrawal';
import { User } from '@/server/entities/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();
    const withdrawalRepository = AppDataSource.getRepository(Withdrawal);
    const history = await withdrawalRepository.find({
      where: { user: { id: decoded.userId } },
      order: { createdAt: 'DESC' }
    });

    return NextResponse.json({ history }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch withdrawal history:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { method, accountNumber, amount } = await req.json();

    if (!method || !accountNumber || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Invalid data provided' }, { status: 400 });
    }

    await connectDB();
    const userRepository = AppDataSource.getRepository(User);
    const withdrawalRepository = AppDataSource.getRepository(Withdrawal);

    const user = await userRepository.findOne({ where: { id: decoded.userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Calculate pending withdrawals to ensure they don't over-withdraw
    const pendingWithdrawals = await withdrawalRepository.find({
      where: { user: { id: user.id }, status: 'pending' }
    });
    
    const totalPending = pendingWithdrawals.reduce((sum, w) => sum + Number(w.amount), 0);
    const availableBalance = Number(user.walletBalance) - totalPending;

    if (availableBalance < Number(amount)) {
      return NextResponse.json({ error: 'Insufficient balance or too many pending requests' }, { status: 400 });
    }

    const newWithdrawal = withdrawalRepository.create({
      user,
      method,
      accountNumber,
      amount: Number(amount)
    });

    await withdrawalRepository.save(newWithdrawal);

    return NextResponse.json({ message: 'Withdrawal request submitted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Failed to create withdrawal:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
