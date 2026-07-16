import { NextApiResponse } from 'next';
import { prisma } from '../../../utils/db';
import { authenticate, AuthenticatedRequest } from '../../../utils/authMiddleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user?.userId;
  const { id } = req.query;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid booking ID' });
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
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify user participates in this booking
    if (booking.clientId !== userId && booking.vendorId !== userId) {
      return res.status(403).json({ message: 'Forbidden: You do not have access to this booking' });
    }

    if (req.method === 'GET') {
      return res.status(200).json({ booking });
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: 'Missing status field' });
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

      return res.status(200).json({ booking: updatedBooking });
    }

    res.setHeader('Allow', ['GET', 'PATCH', 'PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);

  } catch (error) {
    console.error('Error handling booking detail request:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default authenticate(handler);