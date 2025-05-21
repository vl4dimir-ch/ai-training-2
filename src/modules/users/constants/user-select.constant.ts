import { Prisma } from '@prisma/client';

export const userSelect = {
  id: true,
  name: true,
  username: true,
  email: true,
  phone: true,
  website: true,
  createdAt: true,
  updatedAt: true,
  address: {
    select: {
      street: true,
      suite: true,
      city: true,
      zipcode: true,
      geo: {
        select: {
          lat: true,
          lng: true
        }
      }
    }
  },
  company: {
    select: {
      name: true,
      catchPhrase: true,
      bs: true
    }
  }
} satisfies Prisma.UserSelect; 