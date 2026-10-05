import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { User } from '@/server/entities/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { role?: string };
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, isActive } = await req.json();

    if (!userId || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOneBy({ id: userId });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.isActive = isActive;
    await userRepository.save(user);

    return NextResponse.json({ success: true, message: 'User status updated successfully' });
  } catch (error) {
    console.error('Toggle status error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
