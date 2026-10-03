import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { UserPackage } from '@/server/entities/UserPackage';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export async function GET() {
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
    const userPackageRepository = AppDataSource.getRepository(UserPackage);
    
    // Fetch user packages with the associated package info
    const history = await userPackageRepository.find({
      where: { user: { id: decoded.userId } },
      relations: { package: true },
      order: { purchasedAt: 'DESC' }
    });

    // Check expiration on the fly to return correct status
    const now = new Date();
    const updatedHistory = history.map(hp => {
      let currentStatus = hp.status;
      if (new Date(hp.expiresAt) < now && currentStatus === 'active') {
        currentStatus = 'expired';
        // Can also optionally save to DB here, but client-side view is enough
      }
      return {
        ...hp,
        status: currentStatus
      };
    });

    return NextResponse.json({ history: updatedHistory }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch package history:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
