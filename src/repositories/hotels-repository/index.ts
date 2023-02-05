import { prisma } from "@/config";
import { Hotel, Room, TicketType } from "@prisma/client";

async function findOptionHotels() {
  return prisma.hotel.findMany({});
}