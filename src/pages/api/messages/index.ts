import { NextApiResponse } from 'next';
import { prisma } from '../../../utils/db';
import { authenticate, AuthenticatedRequest } from '../../../utils/authMiddleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  if (req.method === 'GET') {
    try {
      // Fetch all messages where user is sender or receiver
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, role: true }
          },
          receiver: {
            select: { id: true, firstName: true, lastName: true, role: true }
          }
        }
      });

      // Group messages by conversation partner
      const conversationsMap = new Map<string, any>();

      for (const msg of messages) {
        // Find the other participant in the message
        const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
        if (!otherUser) continue;

        if (!conversationsMap.has(otherUser.id)) {
          conversationsMap.set(otherUser.id, {
            id: otherUser.id,
            firstName: otherUser.firstName,
            lastName: otherUser.lastName,
            role: otherUser.role,
            lastMessage: {
              id: msg.id,
              text: msg.text,
              createdAt: msg.createdAt,
              senderId: msg.senderId,
            }
          });
        }
      }

      const conversations = Array.from(conversationsMap.values());
      res.status(200).json({ conversations });
      return;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
  } else if (req.method === 'POST') {
    try {
      const { receiverId, text, bookingId } = req.body;

      if (!receiverId || !text || !text.trim()) {
        res.status(400).json({ message: 'Missing required fields: receiverId, text' });
        return;
      }

      // Check if receiver exists
      const receiver = await prisma.user.findUnique({
        where: { id: receiverId }
      });

      if (!receiver) {
        res.status(404).json({ message: 'Recipient user not found' });
        return;
      }

      // Save message
      const message = await prisma.message.create({
        data: {
          senderId: userId,
          receiverId,
          text: text.trim(),
          bookingId: bookingId || null,
        },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true }
          },
          receiver: {
            select: { id: true, firstName: true, lastName: true }
          }
        }
      });

      res.status(201).json({ message });
      return;
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }
}

export default authenticate(handler);
