import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { Task } from '@/server/entities/Task';
import { UserTask } from '@/server/entities/UserTask';
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

    const { taskId } = await req.json();
    if (!taskId) return NextResponse.json({ error: 'Task ID required' }, { status: 400 });

    await connectDB();
    const userRepo = AppDataSource.getRepository(User);
    const userPackageRepo = AppDataSource.getRepository(UserPackage);
    const taskRepo = AppDataSource.getRepository(Task);
    const userTaskRepo = AppDataSource.getRepository(UserTask);

    const user = await userRepo.findOne({ where: { id: decoded.userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // 1. Check Package Limit
    const now = new Date();
    const userPackages = await userPackageRepo.find({
      where: { user: { id: decoded.userId }, status: 'active' },
      relations: { package: true }
    });
    const activePackage = userPackages.find(up => new Date(up.expiresAt) > now);
    
    if (!activePackage) {
      return NextResponse.json({ error: 'No active package' }, { status: 403 });
    }

    // 2. Check Task
    const task = await taskRepo.findOne({ where: { id: taskId } });
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    // 3. Verify Daily Limit
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const completedToday = await userTaskRepo.find({
      where: { user: { id: decoded.userId }, completedDate: todayStr },
      relations: { task: true }
    });

    if (completedToday.length >= activePackage.package.dailyTasks) {
      return NextResponse.json({ error: 'Daily task limit reached' }, { status: 403 });
    }

    // 4. Verify Not Already Completed Today
    if (completedToday.some(ut => ut.task.id === taskId)) {
      return NextResponse.json({ error: 'Task already completed today' }, { status: 400 });
    }

    // 5. Complete Task
    const newUserTask = userTaskRepo.create({
      user,
      task,
      earnedAmount: task.rewardAmount,
      completedDate: todayStr
    });
    await userTaskRepo.save(newUserTask);

    // 6. Add Reward to Wallet
    user.walletBalance = Number(user.walletBalance) + Number(task.rewardAmount);
    await userRepo.save(user);

    return NextResponse.json({ message: 'Task completed successfully', reward: task.rewardAmount }, { status: 200 });

  } catch (error) {
    console.error('Failed to complete task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
