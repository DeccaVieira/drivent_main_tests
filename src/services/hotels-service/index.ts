import { notFoundError } from '@/errors';
import hotelRepository from '@/repositories/hotels-repository/index';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketRepository from '@/repositories/ticket-repository';
import { paymentError } from '@/errors';

async function findHotels(userId: number) {
  const userEnrollment = await enrollmentRepository.findByUserId(userId);
  const ticket = await ticketRepository.findTicketByEnrollmentId(userEnrollment.id);
  const ticketType = await ticketRepository.findTicketTypeById(ticket.ticketTypeId);
  const hotels = await hotelRepository.findOptionHotels();
  if (ticket.status !== 'PAID') {
    throw paymentError();
  }
  if (!userEnrollment) {
    throw notFoundError();
  }
  if (ticketType.isRemote || !ticketType.includesHotel) {
    throw paymentError();
  }
  return hotels;
}

async function findHotelsById(hotelId: number, userId: number) {
  const userEnrollment = await enrollmentRepository.findByUserId(userId);
  const ticket = await ticketRepository.findTicketByEnrollmentId(userEnrollment.id);
  const ticketType = await ticketRepository.findTicketTypeById(ticket.ticketTypeId);
  const optionHotelById = await hotelRepository.findOptionHotelsById(hotelId);

  if (ticket.status !== 'PAID') {
    throw paymentError();
  }

  if (!userEnrollment) {
    throw notFoundError();
  }
  if (ticketType.isRemote || !ticketType.includesHotel ) {
    throw paymentError();
  }

  return optionHotelById;
}

const hotelService = {
  findHotels,
  findHotelsById,
};

export default hotelService;
