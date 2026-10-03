import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { User } from '@/server/entities/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const fullName = formData.get('fullName') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    if (!fullName || !phone || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    await connectDB();
    const userRepository = AppDataSource.getRepository(User);
    
    const existingUser = await userRepository.findOne({ 
      where: [{ phone }, ...(email ? [{ email }] : [])] 
    });
    
    if (existingUser) {
      return NextResponse.json({ error: 'User with this phone or email already exists' }, { status: 400 });
    }

    // Default to pending, no files
    const user = userRepository.create({
      fullName,
      phone,
      email,
      passwordHash,
    });

    await userRepository.save(user);

    return NextResponse.json({ message: 'Registration successful', userId: user.id }, { status: 201 });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
