import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { Package } from '@/server/entities/Package';

export async function GET(req: Request) {
  try {
    await connectDB();
    const packageRepository = AppDataSource.getRepository(Package);
    
    const packages = await packageRepository.find({
      order: {
        price: 'ASC'
      }
    });

    return NextResponse.json({ packages }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch packages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, price, durationDays, dailyTasks } = body;

    if (!name || price === undefined || !durationDays || !dailyTasks) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();
    const packageRepository = AppDataSource.getRepository(Package);

    const newPackage = packageRepository.create({
      name,
      description,
      price: Number(price),
      durationDays: Number(durationDays),
      dailyTasks: Number(dailyTasks)
    });

    await packageRepository.save(newPackage);

    return NextResponse.json({ message: 'Package created successfully', package: newPackage }, { status: 201 });
  } catch (error) {
    console.error('Failed to create package:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
