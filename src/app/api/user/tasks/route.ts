import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { Task } from '@/server/entities/Task';
import { UserTask } from '@/server/entities/UserTask';
import { UserPackage } from '@/server/entities/UserPackage';
import { User } from '@/server/entities/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { In } from 'typeorm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export async function GET(req: Request) {
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

    await connectDB();
    const userPackageRepo = AppDataSource.getRepository(UserPackage);
    const taskRepo = AppDataSource.getRepository(Task);
    const userTaskRepo = AppDataSource.getRepository(UserTask);

    // 1. Get active package
    const now = new Date();
    const userPackages = await userPackageRepo.find({
      where: { user: { id: decoded.userId }, status: 'active' },
      relations: { package: true }
    });

    const activePackage = userPackages.find(up => new Date(up.expiresAt) > now);
    
    if (!activePackage) {
      return NextResponse.json({ locked: true, message: 'No active package' }, { status: 200 });
    }

    const dailyLimit = activePackage.package.dailyTasks;

    // 2. Get today's completed tasks
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const allUserTasks = await userTaskRepo.find({
      where: { user: { id: decoded.userId } },
      relations: { task: true }
    });

    const completedToday = allUserTasks.filter(ut => ut.completedDate === todayStr);
    const completedTodayIds = completedToday.map(ut => ut.task.id);

    // 3. Overall Stats
    const totalCompleted = allUserTasks.length;
    const totalEarned = allUserTasks.reduce((acc, ut) => acc + Number(ut.earnedAmount), 0);

    // 4. Fetch available tasks
    // If daily limit reached, return empty array for available tasks
    const remainingTasksToComplete = Math.max(0, dailyLimit - completedToday.length);
    
    let availableTasks: Task[] = [];
    
    if (remainingTasksToComplete > 0) {
      const allActiveTasks = await taskRepo.find({ where: { isActive: true }, order: { createdAt: 'DESC' } });
      availableTasks = allActiveTasks.filter(t => !completedTodayIds.includes(t.id)).slice(0, remainingTasksToComplete);
    }

    return NextResponse.json({ 
      locked: false,
      dailyLimit,
      completedToday: completedToday.length,
      totalCompleted,
      totalEarned,
      availableTasks,
      completedTodayTasks: completedToday.map(ut => ut.task)
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch user tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
