import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { Withdrawal } from '@/server/entities/Withdrawal';
import { User } from '@/server/entities/User';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const withdrawalRepository = AppDataSource.getRepository(Withdrawal);
    const withdrawal = await withdrawalRepository.findOne({ 
      where: { id },
      relations: { user: true }
    });

    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
    }

    return NextResponse.json({ withdrawal }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch withdrawal:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectDB();
    const withdrawalRepository = AppDataSource.getRepository(Withdrawal);
    const userRepository = AppDataSource.getRepository(User);

    const withdrawal = await withdrawalRepository.findOne({ 
      where: { id },
      relations: { user: true }
    });

    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
    }

    if (withdrawal.status !== 'pending') {
      return NextResponse.json({ error: 'Withdrawal already processed' }, { status: 400 });
    }

    withdrawal.status = status;
    await withdrawalRepository.save(withdrawal);

    // If approved, deduct from user's wallet
    if (status === 'approved') {
      const user = withdrawal.user;
      user.walletBalance = Number(user.walletBalance) - Number(withdrawal.amount);
      await userRepository.save(user);
    }

    return NextResponse.json({ message: `Withdrawal ${status} successfully` }, { status: 200 });
  } catch (error) {
    console.error('Failed to process withdrawal:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
