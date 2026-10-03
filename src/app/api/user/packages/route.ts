import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { Package } from '@/server/entities/Package';

export async function GET() {
  try {
    await connectDB();
    const packageRepository = AppDataSource.getRepository(Package);
    const packages = await packageRepository.find({ order: { price: 'ASC' } });
    return NextResponse.json({ packages }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch packages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
