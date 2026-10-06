import { AppDataSource, connectDB } from '../src/server/config/database';
import { User } from '../src/server/entities/User';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  await connectDB();
  const userRepository = AppDataSource.getRepository(User);
  
  const email = 'admin@admin.com';
  const password = '1234';

  const existingUser = await userRepository.findOneBy({ email });
  if (existingUser) {
    console.log('Admin user already exists. Updating password and role...');
    existingUser.passwordHash = await bcrypt.hash(password, 10);
    existingUser.role = 'admin';
    await userRepository.save(existingUser);
    console.log('Admin user updated successfully.');
  } else {
    console.log('Creating new admin user...');
    const user = userRepository.create({
      fullName: 'Super Admin',
      phone: '01000000000',
      email: email,
      passwordHash: await bcrypt.hash(password, 10),
      kycStatus: 'approved',
      role: 'admin',
      isActive: true,
      referralCode: 'ADMINCODE'
    });
    await userRepository.save(user);
    console.log('Admin user created successfully.');
  }
  
  process.exit(0);
}

createAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
