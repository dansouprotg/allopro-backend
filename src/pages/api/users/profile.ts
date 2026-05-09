import { NextApiResponse } from 'next';
import { prisma } from '../../../utils/db';
import { authenticate, AuthenticatedRequest } from '../../../utils/authMiddleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { password, ...userWithoutPassword } = user;
      res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const {
        firstName,
        lastName,
        phone,
        // Vendor profile fields
        profession,
        description,
        yearsOfExperience,
        workHours,
        businessPhone,
        images,
        specialties,
        location,
      } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update basic user info
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          phone: phone || undefined,
        },
        include: {
          profile: true,
        },
      });

      // Update or Create vendor profile if user is a vendor
      if (user.role === 'VENDOR') {
        if (updatedUser.profile) {
          await prisma.vendorProfile.update({
            where: { userId },
            data: {
              profession: profession || undefined,
              description: description || undefined,
              yearsOfExperience: yearsOfExperience !== undefined ? parseInt(yearsOfExperience) : undefined,
              workHours: workHours || undefined,
              businessPhone: businessPhone || undefined,
              images: images || undefined,
              specialties: specialties || undefined,
              location: location || undefined,
            },
          });
        } else {
          await prisma.vendorProfile.create({
            data: {
              userId,
              profession: profession || 'General',
              description: description || '',
              yearsOfExperience: yearsOfExperience !== undefined ? parseInt(yearsOfExperience) : 0,
              workHours: workHours || '',
              businessPhone: businessPhone || phone || '',
              images: images || [],
              specialties: specialties || [],
              location: location || '',
            },
          });
        }
      }

      // Fetch updated user with profile
      const finalUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
        },
      });

      const { password: _, ...finalUserWithoutPassword } = finalUser!;
      res.status(200).json({ 
        message: 'Profile updated successfully',
        user: finalUserWithoutPassword 
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default authenticate(handler);
