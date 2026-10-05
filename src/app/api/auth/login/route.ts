import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { User } from '@/server/entities/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export async function POST(req: Request) {
  try {
    let { phone, password } = await req.json();
    if (phone) phone = phone.trim();

    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone and password are required' }, { status: 400 });
    }

    await connectDB();
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: [
        { phone },
        { email: phone }
      ]
    });

    console.log("Login attempt for phone:", phone);
    
    if (!user) {
      console.log("User not found in database.");
      return NextResponse.json({ error: 'Invalid credentials (user not found)' }, { status: 401 });
    }

    console.log("User found:", user.id);
    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials (password mismatch)' }, { status: 401 });
    }

    if (user.isActive === false) {
      return NextResponse.json({ error: 'Your account has been deactivated. Contact admin.' }, { status: 403 });
    }

    user.lastLogin = new Date();
    await userRepository.save(user);

    // KYC check removed to allow login before approval

    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const redirectTo = user.role === 'admin' ? '/admin' : '/dashboard';

    const response = NextResponse.json(
      { 
        message: 'Login successful', 
        token, 
        user: { id: user.id, fullName: user.fullName, phone: user.phone, role: user.role },
        redirectTo
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
