import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { SystemSetting } from '@/server/entities/SystemSetting';

export async function GET() {
  try {
    await connectDB();
    const settingRepo = AppDataSource.getRepository(SystemSetting);
    
    // Default values if not set in DB
    let referrerBonus = '0';
    let referredBonus = '0';

    const referrerSetting = await settingRepo.findOneBy({ key: 'referral_bonus_referrer' });
    if (referrerSetting) referrerBonus = referrerSetting.value;

    const referredSetting = await settingRepo.findOneBy({ key: 'referral_bonus_referred' });
    if (referredSetting) referredBonus = referredSetting.value;

    return NextResponse.json({
      referrerBonus,
      referredBonus
    });
  } catch (error) {
    console.error('Public Settings GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
