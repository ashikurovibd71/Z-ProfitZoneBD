import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { Deposit } from '@/server/entities/Deposit';

export async function GET(req: Request) {
  try {
    await connectDB();
    const depositRepository = AppDataSource.getRepository(Deposit);
    
    // Fetch all deposits, order by newest first
    const deposits = await depositRepository.find({
      relations: { user: true },
      order: {
        createdAt: 'DESC'
      }
    });

    // Remove password hashes from users before sending to frontend
    const safeDeposits = deposits.map(deposit => {
      const { passwordHash, ...safeUser } = deposit.user;
      return { ...deposit, user: safeUser };
    });

    return NextResponse.json({ deposits: safeDeposits }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch deposits:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
