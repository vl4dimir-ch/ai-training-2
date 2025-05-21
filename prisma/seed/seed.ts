import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface UserSeedData {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

async function main() {
  try {
    const checkEmpty = await prisma.user.findFirst();

    if (checkEmpty) {
      console.log('Database is not empty, skipping seeding...');
      return;
    }

    // Read the seed file
    const seedFilePath = path.join(__dirname, 'user_seed.json');
    const userData: UserSeedData[] = JSON.parse(fs.readFileSync(seedFilePath, 'utf-8'));

    console.log('Starting to seed the database...');

    for (const user of userData) {
      const geoLocation = await prisma.geoLocation.create({
        data: {
          lat: user.address.geo.lat,
          lng: user.address.geo.lng,
        },
      });

      const address = await prisma.address.create({
        data: {
          street: user.address.street,
          suite: user.address.suite,
          city: user.address.city,
          zipcode: user.address.zipcode,
          geoId: geoLocation.id,
        },
      });

      const company = await prisma.company.create({
        data: {
          name: user.company.name,
          catchPhrase: user.company.catchPhrase,
          bs: user.company.bs,
        },
      });

      await prisma.user.create({
        data: {
          name: user.name,
          username: user.username,
          email: user.email,
          phone: user.phone,
          website: user.website,
          addressId: address.id,
          companyId: company.id,
        },
      });
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
