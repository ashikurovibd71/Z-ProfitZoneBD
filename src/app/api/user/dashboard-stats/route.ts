import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { UserTask } from '@/server/entities/UserTask';
import { UserPackage } from '@/server/entities/UserPackage';
import { Task } from '@/server/entities/Task';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export async function GET(req: Request) {
  try {
    let token = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    if (!token) {
      const cookieHeader = req.headers.get('cookie');
      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split('; ').map(c => {
            const [key, ...v] = c.split('=');
            return [key, v.join('=')];
          })
        );
        token = cookies.token;
      }
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userId = decoded.userId;

    await connectDB();
    const userTaskRepo = AppDataSource.getRepository(UserTask);
    const userPackageRepo = AppDataSource.getRepository(UserPackage);
    const taskRepo = AppDataSource.getRepository(Task);

    // Stats
    const userTasks = await userTaskRepo.find({ where: { user: { id: userId } } });
    const tasksCompleted = userTasks.length;
    const totalEarned = userTasks.reduce((sum, t) => sum + Number(t.earnedAmount), 0);
    const pendingApproval = 0; // Assuming auto approval for now

    // Active package
    const activeUserPackage = await userPackageRepo.findOne({
      where: { user: { id: userId }, status: 'active' },
      relations: { package: true },
      order: { purchasedAt: 'DESC' }
    });

    let activePackageData = null;
    if (activeUserPackage && activeUserPackage.package) {
      const pkg = activeUserPackage.package;
      const today = new Date().toISOString().split('T')[0];
      const todayTasks = userTasks.filter(t => t.completedDate === today).length;
      
      const now = new Date();
      const expiryDate = new Date(activeUserPackage.expiresAt);
      const diffTime = Math.abs(expiryDate.getTime() - now.getTime());
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      activePackageData = {
        name: pkg.name,
        dailyTasks: pkg.dailyTasks,
        daysLeft: daysLeft > 0 ? daysLeft : 0,
        tasksDoneToday: todayTasks
      };
    }

    // Available tasks
    const availableTasksData = await taskRepo.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
      take: 5
    });

    const mappedTasks = availableTasksData.map(t => ({
      title: t.title,
      type: t.type.toUpperCase(),
      reward: Number(t.rewardAmount),
      time: `${t.durationSeconds}s`
    }));

    return NextResponse.json({
      totalEarned,
      tasksCompleted,
      pendingApproval,
      activePackage: activePackageData,
      availableTasks: mappedTasks
    }, { status: 200 });

  } catch (error) {
    console.error('Dashboard Stats API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
