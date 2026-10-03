import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { Deposit } from '@/server/entities/Deposit';
import { User } from '@/server/entities/User';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await req.json(); // expected: 'approved' or 'rejected'

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectDB();
    const depositRepository = AppDataSource.getRepository(Deposit);
    const userRepository = AppDataSource.getRepository(User);

    const deposit = await depositRepository.findOne({ 
      where: { id },
      relations: { user: true }
    });

    if (!deposit) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
    }

    if (deposit.status !== 'pending' && status === 'approved') {
      return NextResponse.json({ error: 'Deposit is already processed' }, { status: 400 });
    }

    deposit.status = status;
    
    // If approved, add amount to user's wallet
    if (status === 'approved') {
      const user = deposit.user;
      
      // No fee on deposit
      const depositAmount = Number(deposit.amount);
      const amountToCredit = depositAmount;
      
      user.walletBalance = Number(user.walletBalance) + amountToCredit;
      await userRepository.save(user);
    }

    await depositRepository.save(deposit);

    return NextResponse.json({ message: `Deposit status updated to ${status}` }, { status: 200 });
  } catch (error) {
    console.error('Failed to update deposit status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
