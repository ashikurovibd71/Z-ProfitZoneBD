import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { Withdrawal } from '@/server/entities/Withdrawal';

export async function GET(req: Request) {
  try {
    await connectDB();
    const withdrawalRepository = AppDataSource.getRepository(Withdrawal);
    const withdrawals = await withdrawalRepository.find({ 
      relations: { user: true },
      order: { createdAt: 'DESC' }
    });
    
    return NextResponse.json({ withdrawals }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch withdrawals:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
