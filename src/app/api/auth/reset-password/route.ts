import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { User } from '@/server/entities/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    let { identifier, newPassword } = await req.json();
    if (identifier) identifier = identifier.trim();

    if (!identifier || !newPassword) {
      return NextResponse.json({ error: 'Email/Phone and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    await connectDB();
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: [
        { phone: identifier },
        { email: identifier }
      ]
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found with this email or phone' }, { status: 404 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.passwordHash = hashedPassword;
    await userRepository.save(user);

    return NextResponse.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Password Reset Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
