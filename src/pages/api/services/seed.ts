import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const services = [
      { name: 'Plumbing', category: 'Home Repair', icon: 'water-pump', description: 'Expert plumbing services for leaks, installations, and repairs.' },
      { name: 'Electrical', category: 'Home Repair', icon: 'lightning-bolt', description: 'Certified electricians for wiring, fixtures, and troubleshooting.' },
      { name: 'Carpentry', category: 'Home Improvement', icon: 'hammer-wrench', description: 'Custom furniture, repairs, and woodworking.' },
      { name: 'Painting', category: 'Home Improvement', icon: 'format-paint', description: 'Interior and exterior painting services.' },
      { name: 'Cleaning', category: 'Maintenance', icon: 'broom', description: 'Deep cleaning, regular housekeeping, and post-construction.' },
      { name: 'Hair & Beauty', category: 'Personal Care', icon: 'content-cut', description: 'Professional stylists, makeup artists, and spa services.' },
      { name: 'Mechanic', category: 'Auto Repair', icon: 'car-wrench', description: 'Mobile mechanics for car repairs and maintenance.' },
      { name: 'AC Repair', category: 'Appliance Repair', icon: 'air-conditioner', description: 'HVAC technicians for cooling systems.' },
    ];

    const result = await prisma.service.createMany({
      data: services,
      skipDuplicates: true,
    });

    res.status(201).json({ message: 'Default services seeded successfully', count: result.count });
  } catch (error) {
    console.error('Error seeding services:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
