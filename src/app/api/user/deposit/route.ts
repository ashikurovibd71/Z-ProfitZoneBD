import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { User } from '@/server/entities/User';
import { Deposit } from '@/server/entities/Deposit';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export async function POST(req: Request) {
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

    const { amount, paymentMethod, lastDigitNumber, transactionId } = await req.json();

    if (!amount || !paymentMethod || !lastDigitNumber || !transactionId) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await connectDB();
    const userRepository = AppDataSource.getRepository(User);
    const depositRepository = AppDataSource.getRepository(Deposit);

    const user = await userRepository.findOne({ where: { id: decoded.userId } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const deposit = new Deposit();
    deposit.user = user;
    deposit.amount = Number(amount);
    deposit.paymentMethod = paymentMethod;
    deposit.lastDigitNumber = lastDigitNumber;
    deposit.transactionId = transactionId;
    deposit.status = 'pending';

    await depositRepository.save(deposit);

    return NextResponse.json({ message: 'Deposit request submitted successfully', deposit }, { status: 201 });
  } catch (error) {
    console.error('Deposit Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
