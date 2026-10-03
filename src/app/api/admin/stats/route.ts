import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { User } from '@/server/entities/User';
import { Deposit } from '@/server/entities/Deposit';
import { Withdrawal } from '@/server/entities/Withdrawal';

export async function GET() {
  try {
    await connectDB();
    const userRepo = AppDataSource.getRepository(User);
    const depositRepo = AppDataSource.getRepository(Deposit);
    const withdrawalRepo = AppDataSource.getRepository(Withdrawal);

    const totalUsers = await userRepo.count();
    const pendingKyc = await userRepo.count({ where: { kycStatus: 'pending' } });
    const pendingDeposits = await depositRepo.count({ where: { status: 'pending' } });
    const pendingWithdrawals = await withdrawalRepo.count({ where: { status: 'pending' } });

    // Fees calculation
    const approvedDeposits = await depositRepo.find({ where: { status: 'approved' } });
    const totalDepositAmount = approvedDeposits.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const depositFees = totalDepositAmount * 0.06;

    const approvedWithdrawals = await withdrawalRepo.find({ where: { status: 'approved' } });
    const totalWithdrawalAmount = approvedWithdrawals.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const withdrawalFees = totalWithdrawalAmount * 0.06;

    const totalRevenue = depositFees + withdrawalFees;

    return NextResponse.json({
      totalUsers,
      pendingKyc,
      pendingDeposits,
      pendingWithdrawals,
      depositFees,
      withdrawalFees,
      totalRevenue
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
