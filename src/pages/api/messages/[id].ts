import { NextApiResponse } from 'next';
import { prisma } from '../../../utils/db';
import { authenticate, AuthenticatedRequest } from '../../../utils/authMiddleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user?.userId;
  const { id: otherUserId } = req.query;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!otherUserId || typeof otherUserId !== 'string') {
    return res.status(400).json({ message: 'Invalid recipient ID' });
  }

  if (req.method === 'GET') {
    try {
      // Fetch all messages exchanged between these two users
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId }
          ]
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      res.status(200).json({ messages });
    } catch (error) {
      console.error('Error fetching message history:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default authenticate(handler);
