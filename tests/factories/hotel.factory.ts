import faker from '@faker-js/faker';
import { prisma } from '@/config';
import { Hotel } from '@prisma/client';

export async function createTicketTypeBoolean(isRemote: boolean, includesHotel: boolean) {
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote,
      includesHotel,
    },
  });
}

export async function createHotel() {
  return prisma.hotel.create({
    data: 
      {
        name: faker.name.findName(),
        image: 'Teste',
      }
    
  });
}

export async function MakeHotelId(hotelId: number, isValid: boolean) {
  let hotel: Hotel = {
    id: 2,
    name: '',
    image: '',
    createdAt: undefined,
    updatedAt: undefined,
  };

  if (isValid) {
    hotel = await prisma.hotel.findFirst({
      where: {
        id: hotelId,
      },
    });
    return hotel.id;
  } else {
    hotel = await prisma.hotel.findFirst({});
    return hotel.id - 1;
  }
}
