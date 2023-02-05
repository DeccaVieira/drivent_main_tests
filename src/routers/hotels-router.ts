import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getHotels, findHotelsById } from '@/controllers/hotels-controller';
const hotelsRouter = Router();

hotelsRouter.all('/*', authenticateToken).get('/hotels', getHotels).get('/hotels/:hotelId', findHotelsById);

export { hotelsRouter };
