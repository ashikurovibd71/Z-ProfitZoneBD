import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { User } from '@/server/entities/User';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await req.json(); // expected: 'approved' or 'rejected'

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectDB();
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({ where: { id } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.kycStatus = status;
    await userRepository.save(user);

    return NextResponse.json({ message: `KYC status updated to ${status}` }, { status: 200 });
  } catch (error) {
    console.error('Failed to update KYC status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
