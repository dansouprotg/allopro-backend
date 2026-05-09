import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          profile: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Hide sensitive data
      const { password, ...userWithoutPassword } = user;
      res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}