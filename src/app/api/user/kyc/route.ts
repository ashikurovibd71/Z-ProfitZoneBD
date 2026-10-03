import { NextResponse } from 'next/server';
import { connectDB, AppDataSource } from '@/server/config/database';
import { User } from '@/server/entities/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export async function POST(req: Request) {
  try {
    let token = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    if (!token) {
      const cookieHeader = req.headers.get('cookie');
      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split('; ').map(c => {
            const [key, ...v] = c.split('=');
            return [key, v.join('=')];
          })
        );
        token = cookies.token;
      }
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const formData = await req.formData();
    
    const profilePicture = formData.get('profilePicture') as File | null;
    const nidFront = formData.get('nidFront') as File | null;
    const nidBack = formData.get('nidBack') as File | null;

    if (!profilePicture || !nidFront || !nidBack) {
      return NextResponse.json({ error: 'Please upload all 3 files' }, { status: 400 });
    }

    // Upload files to ImgBB
    const saveFile = async (file: File | null) => {
      if (!file) return null;
      
      const imgFormData = new FormData();
      imgFormData.append('image', file);
      
      try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=e4a9e96b0fc37f306f6c2ea25bd2e725`, {
          method: 'POST',
          body: imgFormData,
        });
        
        const data = await response.json();
        if (data.success) {
          return data.data.url;
        } else {
          console.error('ImgBB upload error:', data);
          return null;
        }
      } catch (err) {
        console.error('Error uploading to ImgBB:', err);
        return null;
      }
    };

    const profilePicPath = await saveFile(profilePicture);
    const nidFrontPath = await saveFile(nidFront);
    const nidBackPath = await saveFile(nidBack);

    await connectDB();
    const userRepository = AppDataSource.getRepository(User);
    
    const user = await userRepository.findOne({ 
      where: { id: decoded.userId } 
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (profilePicPath) user.profilePicture = profilePicPath;
    if (nidFrontPath) user.nidFront = nidFrontPath;
    if (nidBackPath) user.nidBack = nidBackPath;
    user.kycStatus = 'pending';

    await userRepository.save(user);

    return NextResponse.json({ message: 'KYC documents submitted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('KYC Upload Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
