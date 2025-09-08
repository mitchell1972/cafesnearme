const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    // Get sample of cafes
    const cafes = await prisma.cafe.findMany({
      take: 10,
      select: {
        name: true,
        postcode: true,
        city: true,
        latitude: true,
        longitude: true,
        address: true
      }
    });
    
    console.log('Sample cafes in database:');
    cafes.forEach(cafe => {
      console.log(`- ${cafe.name}: ${cafe.city}, ${cafe.postcode} (${cafe.latitude}, ${cafe.longitude})`);
    });
    
    // Check for specific postcodes
    const ss7Cafes = await prisma.cafe.findMany({
      where: {
        postcode: {
          contains: 'SS7'
        }
      },
      take: 5
    });
    
    console.log('\nCafes with SS7 postcode:', ss7Cafes.length);
    
    // Check for Ipswich
    const ipswichCafes = await prisma.cafe.findMany({
      where: {
        OR: [
          { city: { contains: 'Ipswich' } },
          { postcode: { startsWith: 'IP' } }
        ]
      },
      take: 5
    });
    
    console.log('Cafes in Ipswich area:', ipswichCafes.length);
    
    // Get unique cities
    const uniqueCities = await prisma.cafe.findMany({
      distinct: ['city'],
      select: { city: true },
      take: 20
    });
    
    console.log('\nUnique cities in database:');
    uniqueCities.forEach(c => console.log(`- ${c.city}`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
