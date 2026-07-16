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
      const { role } = req.user!;
      
      const whereClause: any = {};
      if (role === 'VENDOR') {
        whereClause.vendorId = userId;
      } else {
        whereClause.clientId = userId;
      }

      const bookings = await prisma.booking.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { firstName: true, lastName: true, phone: true } },
          vendor: { select: { firstName: true, lastName: true, phone: true } },
        },
      });

      res.status(200).json({ bookings });
      return;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
  } else if (req.method === 'POST') {
    try {
      const { vendorId, serviceId, clientAddress, totalAmount } = req.body;

      if (!vendorId || !serviceId) {
        res.status(400).json({ message: 'Missing required fields: vendorId, serviceId' });
        return;
      }

      // Generate a unique 6-digit security code for QR verification
      const securityCode = Math.floor(100000 + Math.random() * 900000).toString();

      const booking = await prisma.booking.create({
        data: {
          clientId: userId,
          vendorId,
          serviceId,
          matchingFee: 1500,
          totalAmount: totalAmount || 5500,
          securityCode,
          clientAddress: clientAddress || 'Lomé, Togo',
          status: 'CONFIRMED', // Immediately confirmed on payment
        },
        include: {
          vendor: { select: { firstName: true, lastName: true } },
          client: { select: { firstName: true, lastName: true } }
        }
      });

      res.status(201).json({ booking });
      return;
    } catch (error) {
      console.error('Error creating booking:', error);
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