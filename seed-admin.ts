import { connectDB, AppDataSource } from './src/server/config/database';
import { User } from './src/server/entities/User';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('ডাটাবেজে কানেক্ট করা হচ্ছে...');
  await connectDB();

  const userRepository = AppDataSource.getRepository(User);
  const email = 'admin@admin.com';
  const phone = '01000000000'; // Dummy phone as it's required
  const password = '1234';

  let user = await userRepository.findOne({ where: [{ email }, { phone }] });

  if (user) {
    console.log('এই ইমেইল বা ফোন নাম্বারের ইউজার আগে থেকেই আছে। আপডেট করা হচ্ছে...');
  } else {
    user = new User();
    user.fullName = 'Admin User';
    user.phone = phone;
    user.email = email;
  }

  user.passwordHash = await bcrypt.hash(password, 10);
  user.role = 'admin';
  user.kycStatus = 'approved';
  
  await userRepository.save(user);

  console.log('\n✅ সফলভাবে অ্যাডমিন একাউন্ট তৈরি করা হয়েছে!');
  console.log(`Email: ${email}`);
  console.log(`Phone: ${phone}`);
  console.log(`Password: ${password}`);
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
