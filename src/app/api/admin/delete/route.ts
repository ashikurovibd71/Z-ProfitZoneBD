import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { User } from '@/server/entities/User';
import { Deposit } from '@/server/entities/Deposit';
import { Withdrawal } from '@/server/entities/Withdrawal';
import { Package } from '@/server/entities/Package';
import { Task } from '@/server/entities/Task';
import { UserPackage } from '@/server/entities/UserPackage';
import { UserTask } from '@/server/entities/UserTask';

export async function DELETE(req: Request) {
  try {
    const { entity, ids } = await req.json();
    if (!ids || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
    }

    await connectDB();
    let repo: any;
    
    switch(entity) {
      case 'User': repo = AppDataSource.getRepository(User); break;
      case 'Deposit': repo = AppDataSource.getRepository(Deposit); break;
      case 'Withdrawal': repo = AppDataSource.getRepository(Withdrawal); break;
      case 'Package': repo = AppDataSource.getRepository(Package); break;
      case 'Task': repo = AppDataSource.getRepository(Task); break;
      case 'UserPackage': repo = AppDataSource.getRepository(UserPackage); break;
      case 'UserTask': repo = AppDataSource.getRepository(UserTask); break;
      default: return NextResponse.json({ error: 'Invalid entity' }, { status: 400 });
    }
    
    // For users, it's safer to delete related records first or let cascading handle it.
    // Assuming cascading is set up or we can just run delete. TypeORM's delete() will fail if there are FK constraints without ON DELETE CASCADE.
    // If it fails, we will catch it.
    await repo.delete(ids);
    
    return NextResponse.json({ success: true, message: `Deleted ${ids.length} records from ${entity}` });
  } catch (error: any) {
    console.error('Generic Delete Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete' }, { status: 500 });
  }
}
