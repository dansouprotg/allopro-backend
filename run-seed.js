const { prisma } = require('./src/utils/db.ts');

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

async function main() {
  console.log('Seeding database with default services...');
  
  // First clear existing to avoid duplicates since we don't have unique constraints
  await prisma.service.deleteMany({});
  
  const result = await prisma.service.createMany({
    data: services,
  });
  
  console.log(`Successfully seeded ${result.count} services.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
