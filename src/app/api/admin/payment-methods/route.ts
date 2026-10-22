import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { SystemSetting } from '@/server/entities/SystemSetting';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export interface PaymentMethod {
  id: string;
  name: string;
  number: string;
  type: string; // Personal, Agent, Merchant
  instruction: string;
  minDeposit?: number;
  maxDeposit?: number;
  isActive: boolean;
}

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm_bkash',
    name: 'bKash',
    number: '01700000000',
    type: 'Personal',
    instruction: 'বিকাশ অ্যাপ বা *247# ডায়াল করে Send Money করুন। রেফারেন্সে আপনার ফোন নম্বর দিন।',
    minDeposit: 100,
    maxDeposit: 25000,
    isActive: true
  },
  {
    id: 'pm_nagad',
    name: 'Nagad',
    number: '01800000000',
    type: 'Personal',
    instruction: 'নগদ অ্যাপ বা *167# ডায়াল করে Send Money করুন। ক্যাশ ইন বা ক্যাশ আউট গ্রহণযোগ্য নয়।',
    minDeposit: 100,
    maxDeposit: 25000,
    isActive: true
  },
  {
    id: 'pm_rocket',
    name: 'Rocket',
    number: '01900000000-0',
    type: 'Personal',
    instruction: 'রকেট অ্যাপ থেকে Send Money করুন (১২ ডিজিটের সঠিক অ্যাকাউন্ট নম্বর ব্যবহার করুন)।',
    minDeposit: 100,
    maxDeposit: 25000,
    isActive: false
  }
];

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, JWT_SECRET) as { role?: string };
    if (decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await connectDB();
    const settingRepo = AppDataSource.getRepository(SystemSetting);
    const setting = await settingRepo.findOneBy({ key: 'payment_methods' });

    let methods: PaymentMethod[] = DEFAULT_PAYMENT_METHODS;
    if (setting && setting.value) {
      try {
        const parsed = JSON.parse(setting.value);
        if (Array.isArray(parsed)) {
          methods = parsed;
        }
      } catch (err) {
        console.error('Failed to parse payment_methods JSON:', err);
      }
    }

    return NextResponse.json({ methods });
  } catch (error) {
    console.error('Admin Payment Methods GET Error:', error);
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

    const body = await req.json();
    const { methods } = body;

    if (!Array.isArray(methods)) {
      return NextResponse.json({ error: 'methods must be an array' }, { status: 400 });
    }

    await connectDB();
    const settingRepo = AppDataSource.getRepository(SystemSetting);
    
    let setting = await settingRepo.findOneBy({ key: 'payment_methods' });
    if (!setting) {
      setting = settingRepo.create({
        key: 'payment_methods',
        value: JSON.stringify(methods)
      });
    } else {
      setting.value = JSON.stringify(methods);
    }

    await settingRepo.save(setting);

    return NextResponse.json({
      success: true,
      message: 'Payment methods saved successfully',
      methods
    });
  } catch (error) {
    console.error('Admin Payment Methods POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
