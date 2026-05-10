import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: id as string },
        include: {
          vendor: {
            include: { profile: true }
          },
          client: true
        }
      });
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      return res.status(200).json({ booking });
    } catch (error) {
      console.error('Error fetching booking:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'PATCH' || req.method === 'PUT') {
    const { status } = req.body;

    try {
      const data: any = { status };
      
      if (status === 'IN_PROGRESS') {
        data.startedAt = new Date();
      } else if (status === 'COMPLETED') {
        data.completedAt = new Date();
      }

      const updatedBooking = await prisma.booking.update({
        where: { id: id as string },
        data
      });

      return res.status(200).json({ booking: updatedBooking });
    } catch (error) {
      console.error('Error updating booking:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'PATCH', 'PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}