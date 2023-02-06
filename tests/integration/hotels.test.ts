import app, { init } from '@/app';
import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import { createEnrollmentWithAddress, createUser, createTicketType, createTicket } from '../factories';
import { createHotel, createTicketTypeBoolean, MakeHotelId } from '../factories/hotel.factory';
import { cleanDb, generateValidToken } from '../helpers';
import { TicketStatus } from '@prisma/client';
import hotelRepository from '@/repositories/hotels-repository';
import { isValid } from '@brazilian-utils/brazilian-utils/dist/utilities/inscricao-estadual';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /hotels', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/hotels');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it('should respond with status when ticket.status !== PAID', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const isRemote = false;
    const includesHotel = true;
    const ticketType = await createTicketTypeBoolean(isRemote, includesHotel);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
  });

  it('should respond with status when ticket is Remote', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const isRemote = true;
    const includesHotel = true;
    const ticketType = await createTicketTypeBoolean(isRemote, includesHotel);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
  });

  it('should respond with status when ticket is not Remote', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const isRemote = false;
    const includesHotel = false;
    const ticketType = await createTicketTypeBoolean(isRemote, includesHotel);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
  });
});
describe('when token is valid', () => {
  it('should respond with status 200 and with existing hotels', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const isRemote = false;
    const includesHotel = true;
    const ticketType = await createTicketTypeBoolean(isRemote, includesHotel);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createHotel();
    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
    expect(response.status).toEqual(httpStatus.OK);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          image: expect.any(String),
        }),
      ]),
    );
  });
});
describe('GET /hotels/:hotelId', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/hotels/');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/hotels/').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/hotels/').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it('should respond with status when ticket.status !== PAID', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const isRemote = false;
    const includesHotel = true;
    const ticketType = await createTicketTypeBoolean(isRemote, includesHotel);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
    const hotel = await createHotel();
    const isValid = true;
    const hotelId = await MakeHotelId(hotel.id, isValid);
    const response = await server.get(`/hotels/${hotelId}`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
  });

  it('should respond with status when ticket is Remote', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const isRemote = true;
    const includesHotel = true;
    const ticketType = await createTicketTypeBoolean(isRemote, includesHotel);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const response = await server.get('/hotels/').set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
  });

  it('should respond with status when ticket is not Remote', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const isRemote = false;
    const includesHotel = false;
    const ticketType = await createTicketTypeBoolean(isRemote, includesHotel);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
  });

  describe('when token is valid', () => {
    it('should respond with status when there is no room in this hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const isRemote = false;
      const includesHotel = true;
      const ticketType = await createTicketTypeBoolean(isRemote, includesHotel);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const response = await server.get('/hotels/').set('Authorization', `Bearer ${token}`);
      expect(response.body).toEqual([]);
    });
  });
});
