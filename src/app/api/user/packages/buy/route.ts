import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { Package } from '@/server/entities/Package';
import { UserPackage } from '@/server/entities/UserPackage';
import { User } from '@/server/entities/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

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

    const { packageId } = await req.json();
    if (!packageId) return NextResponse.json({ error: 'Package ID required' }, { status: 400 });

    await connectDB();
    const userRepository = AppDataSource.getRepository(User);
    const packageRepository = AppDataSource.getRepository(Package);
    const userPackageRepository = AppDataSource.getRepository(UserPackage);

    const user = await userRepository.findOne({ where: { id: decoded.userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const pkg = await packageRepository.findOne({ where: { id: packageId } });
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });

    if (Number(user.walletBalance) < Number(pkg.price)) {
      return NextResponse.json({ error: 'Insufficient balance to buy this package. Please deposit.' }, { status: 400 });
    }

    // Deduct balance
    user.walletBalance = Number(user.walletBalance) - Number(pkg.price);
    await userRepository.save(user);

    // Create UserPackage
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + pkg.durationDays);

    const newUserPackage = userPackageRepository.create({
      user,
      package: pkg,
      purchasePrice: pkg.price,
      expiresAt,
      status: 'active'
    });

    await userPackageRepository.save(newUserPackage);

    return NextResponse.json({ message: 'Package purchased successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Failed to buy package:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
