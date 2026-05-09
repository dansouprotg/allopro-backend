import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const services = await prisma.service.findMany({
        orderBy: { name: 'asc' },
      });
      res.status(200).json({ services });
    } catch (error) {
      console.error('Error fetching services:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, category, description, icon } = req.body;
      const newService = await prisma.service.create({
        data: { name, category, description, icon },
      });
      res.status(201).json({ service: newService });
    } catch (error) {
      console.error('Error creating service:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}