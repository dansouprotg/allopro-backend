import { NextApiResponse } from 'next';
import { prisma } from '../../../utils/db';
import { authenticate, AuthenticatedRequest } from '../../../utils/authMiddleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  const userId = req.user?.userId;
  const { id } = req.query;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  if (!id || typeof id !== 'string') {
    res.status(400).json({ message: 'Invalid booking ID' });
    return;
  }

  try {
    // Fetch booking first to check authorization
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, firstName: true, lastName: true } },
        vendor: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Verify user participates in this booking
    if (booking.clientId !== userId && booking.vendorId !== userId) {
      res.status(403).json({ message: 'Forbidden: You do not have access to this booking' });
      return;
    }

    if (req.method === 'GET') {
      res.status(200).json({ booking });
      return;
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      const { status } = req.body;

      if (!status) {
        res.status(400).json({ message: 'Missing status field' });
        return;
      }

      const updateData: any = { status };
      
      if (status === 'IN_PROGRESS') {
        updateData.startedAt = new Date();
      } else if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: updateData,
        include: {
          client: { select: { firstName: true, lastName: true } },
          vendor: { select: { firstName: true, lastName: true } }
        }
      });

      res.status(200).json({ booking: updatedBooking });
      return;
    }

    res.setHeader('Allow', ['GET', 'PATCH', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;

  } catch (error) {
    console.error('Error handling booking detail request:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
}

export default authenticate(handler);