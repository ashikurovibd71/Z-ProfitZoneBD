import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { User } from '@/server/entities/User';
import { SystemSetting } from '@/server/entities/SystemSetting';
import bcrypt from 'bcryptjs';

function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const fullName = formData.get('fullName') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const referralCodeInput = formData.get('referralCode') as string;
    
    if (!fullName || !phone || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    await connectDB();
    const userRepository = AppDataSource.getRepository(User);
    const settingRepository = AppDataSource.getRepository(SystemSetting);
    
    const existingUser = await userRepository.findOne({ 
      where: [{ phone }, ...(email ? [{ email }] : [])] 
    });
    
    if (existingUser) {
      return NextResponse.json({ error: 'User with this phone or email already exists' }, { status: 400 });
    }

    let refereeBonus = 0;
    let referrerBonus = 0;
    let referredBy: string | null = null;

    if (referralCodeInput) {
      const referrer = await userRepository.findOneBy({ referralCode: referralCodeInput.toUpperCase() });
      if (referrer) {
        referredBy = referrer.id;
        
        const rfrrBonusSetting = await settingRepository.findOneBy({ key: 'referrerBonus' });
        const rfeeBonusSetting = await settingRepository.findOneBy({ key: 'refereeBonus' });
        
        referrerBonus = rfrrBonusSetting ? parseFloat(rfrrBonusSetting.value) : 0;
        refereeBonus = rfeeBonusSetting ? parseFloat(rfeeBonusSetting.value) : 0;

        // Give referrer their bonus
        if (referrerBonus > 0) {
          referrer.walletBalance = Number(referrer.walletBalance) + referrerBonus;
          await userRepository.save(referrer);
        }
      }
    }

    // Ensure unique referral code
    let referralCode = generateReferralCode();
    while (await userRepository.findOneBy({ referralCode })) {
      referralCode = generateReferralCode();
    }

    // Default to pending, no files
    const user = userRepository.create({
      fullName,
      phone,
      email,
      passwordHash,
      referralCode,
      referredBy,
      walletBalance: refereeBonus // Start with referee bonus
    });

    await userRepository.save(user);

    return NextResponse.json({ message: 'Registration successful', userId: user.id }, { status: 201 });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
