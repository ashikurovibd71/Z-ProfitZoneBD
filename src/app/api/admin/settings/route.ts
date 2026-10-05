import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { SystemSetting } from '@/server/entities/SystemSetting';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, JWT_SECRET) as { role?: string };
    if (decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await connectDB();
    const settingRepo = AppDataSource.getRepository(SystemSetting);
    const settings = await settingRepo.find();
    
    const settingsMap: Record<string, string> = {};
    settings.forEach(s => settingsMap[s.key] = s.value);

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error('Settings GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, JWT_SECRET) as { role?: string };
    if (decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { key, value } = await req.json();

    if (!key || typeof value === 'undefined') {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    await connectDB();
    const settingRepo = AppDataSource.getRepository(SystemSetting);
    
    let setting = await settingRepo.findOneBy({ key });
    if (!setting) {
      setting = settingRepo.create({ key, value: String(value) });
    } else {
      setting.value = String(value);
    }
    
    await settingRepo.save(setting);

    return NextResponse.json({ success: true, message: 'Setting updated successfully' });
  } catch (error) {
    console.error('Settings POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
