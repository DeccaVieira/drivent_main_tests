import { notFoundError } from "@/errors";
import hotelRepository from "@/repositories/hotels-repository/index";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { paymentError } from "@/errors";

async function findHotels(userId: number) {
  const userEnrollment = await enrollmentRepository.findByUserId(userId);
  const ticket = await ticketRepository.findTicketByEnrollmentId(userEnrollment.id);
  const ticketType = await ticketRepository.findTicketTypeById(ticket.ticketTypeId);
  const hotels = await hotelRepository.findOptionHotels();

  if (!userEnrollment) {
    throw notFoundError();
  }
  if (ticketType.isRemote || !ticketType.includesHotel || ticket.status !== "PAID") {
    throw paymentError();
  }
  return hotels;
}
