import express from 'express';
import {
  createVenue,
  getVenue,
  deleteVenue,
} from '../controllers/venue.controller';

const venuesRouter = express.Router();

/* Venue Controller */
venuesRouter.post('/', createVenue);
venuesRouter.get('/:venueId', getVenue);
venuesRouter.delete('/:venueId', deleteVenue);

export = venuesRouter;
