import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { Package } from '@/server/entities/Package';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await connectDB();
    const packageRepository = AppDataSource.getRepository(Package);

    const pkg = await packageRepository.findOne({ where: { id } });

    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    await packageRepository.remove(pkg);

    return NextResponse.json({ message: 'Package deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete package:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
