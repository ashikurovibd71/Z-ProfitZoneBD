import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { SystemSetting } from '@/server/entities/SystemSetting';

export interface PublicPaymentMethod {
  id: string;
  name: string;
  number: string;
  type: string;
  instruction: string;
  minDeposit?: number;
  maxDeposit?: number;
  isActive: boolean;
}

const DEFAULT_PAYMENT_METHODS: PublicPaymentMethod[] = [
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
  }
];

export async function GET() {
  try {
    await connectDB();
    const settingRepo = AppDataSource.getRepository(SystemSetting);
    const setting = await settingRepo.findOneBy({ key: 'payment_methods' });

    let methods: PublicPaymentMethod[] = DEFAULT_PAYMENT_METHODS;
    if (setting && setting.value) {
      try {
        const parsed = JSON.parse(setting.value);
        if (Array.isArray(parsed)) {
          methods = parsed;
        }
      } catch (err) {
        console.error('Failed to parse payment_methods JSON in public route:', err);
      }
    }

    // Return only active methods
    const activeMethods = methods.filter((m) => m.isActive);

    return NextResponse.json({
      methods: activeMethods.length > 0 ? activeMethods : DEFAULT_PAYMENT_METHODS
    });
  } catch (error) {
    console.error('Public Payment Methods GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
