import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { Task } from '@/server/entities/Task';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const taskRepository = AppDataSource.getRepository(Task);

    const task = await taskRepository.findOne({ where: { id } });
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    await taskRepository.remove(task);
    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
