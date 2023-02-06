import { prisma } from '@/config';
import { Hotel, Room, TicketType } from '@prisma/client';

async function findOptionHotels() {
  return prisma.hotel.findMany({});
}

async function findOptionHotelsById(hotelId: number) {
  const hotels = await prisma.hotel.findFirst({
    where: { id: hotelId },
    include: {
      Rooms: {
        where: {
          hotelId,
        },
      },
    },
  });
  return hotels;
}

const hotelRepository = { findOptionHotels, findOptionHotelsById };

export default hotelRepository;
