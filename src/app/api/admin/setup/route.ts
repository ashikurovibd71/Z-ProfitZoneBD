import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { User } from '@/server/entities/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectDB();
    const userRepository = AppDataSource.getRepository(User);
    
    const email = 'admin@admin.com';
    const password = '1234';

    let user = await userRepository.findOneBy({ email });
    if (user) {
      user.passwordHash = await bcrypt.hash(password, 10);
      user.role = 'admin';
      user.isActive = true;
      await userRepository.save(user);
      return NextResponse.json({ message: 'Admin user updated successfully.' });
    } else {
      user = userRepository.create({
        fullName: 'Super Admin',
        phone: '01000000000',
        email: email,
        passwordHash: await bcrypt.hash(password, 10),
        kycStatus: 'approved',
        role: 'admin',
        isActive: true,
        referralCode: 'ADMINCODE'
      });
      await userRepository.save(user);
      return NextResponse.json({ message: 'Admin user created successfully.' });
    }
  } catch (error: any) {
    console.error('Setup Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
