import { connectDB, AppDataSource } from './src/server/config/database';
import { User } from './src/server/entities/User';

async function main() {
  const phone = process.argv[2];
  
  if (!phone) {
    console.error('\n❌ অনুগ্রহ করে কমান্ডের সাথে একটি ফোন নাম্বার দিন।');
    console.error('👉 Example: npx tsx make-admin.ts 01700000000\n');
    process.exit(1);
  }

  console.log('ডাটাবেজে কানেক্ট করা হচ্ছে...');
  await connectDB();

  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { phone } });

  if (!user) {
    console.error(`\n❌ ${phone} নাম্বারের কোনো ইউজার ডাটাবেজে পাওয়া যায়নি!`);
    console.error('আগে ওয়েবসাইটে গিয়ে এই নাম্বার দিয়ে একটি একাউন্ট খুলুন।\n');
    process.exit(1);
  }

  user.role = 'admin';
  user.kycStatus = 'approved';
  
  await userRepository.save(user);

  console.log(`\n✅ সফলভাবে ${phone} নাম্বারটিকে অ্যাডমিন করা হয়েছে!`);
  console.log('এখন আপনি এই নাম্বার দিয়ে লগিন করলে অ্যাডমিন ড্যাশবোর্ড দেখতে পাবেন।\n');
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
