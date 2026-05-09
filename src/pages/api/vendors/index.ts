import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { specialty, search } = req.query;

  try {
    // Build the query object dynamically
    const where: any = {
      role: 'VENDOR',
      isActive: true,
      profile: {
        isNot: null
      }
    };

    if (specialty) {
      where.profile = {
        ...where.profile,
        specialties: {
          has: specialty as string
        }
      };
    }

    if (search) {
      const searchStr = search as string;
      where.OR = [
        { firstName: { contains: searchStr, mode: 'insensitive' } },
        { lastName: { contains: searchStr, mode: 'insensitive' } },
        {
          profile: {
            OR: [
              { profession: { contains: searchStr, mode: 'insensitive' } },
              { description: { contains: searchStr, mode: 'insensitive' } },
              { specialties: { has: searchStr } }
            ]
          }
        }
      ];
    }

    const vendors = await prisma.user.findMany({
      where,
      include: {
        profile: true,
      }
    });

    res.status(200).json({ vendors });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
