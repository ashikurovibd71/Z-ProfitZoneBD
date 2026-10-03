import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { Task } from '@/server/entities/Task';

export async function GET(req: Request) {
  try {
    await connectDB();
    const taskRepository = AppDataSource.getRepository(Task);
    const tasks = await taskRepository.find({ order: { createdAt: 'DESC' } });
    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, url, type, rewardAmount, durationSeconds } = body;

    if (!title || !url || !type || rewardAmount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();
    const taskRepository = AppDataSource.getRepository(Task);

    const newTask = taskRepository.create({
      title,
      url,
      type,
      rewardAmount: Number(rewardAmount),
      durationSeconds: Number(durationSeconds || 30)
    });

    await taskRepository.save(newTask);

    return NextResponse.json({ message: 'Task created successfully', task: newTask }, { status: 201 });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
