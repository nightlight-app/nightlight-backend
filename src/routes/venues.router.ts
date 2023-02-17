import express from 'express';
import {
  createVenue,
  getVenue,
  deleteVenue,
  addReactionToVenue,
  deleteReactionFromVenue,
} from '../controllers/venue.controller';

const venuesRouter = express.Router();

/* Venue Controller */
venuesRouter.post('/', createVenue);
venuesRouter.get('/:venueId', getVenue);
venuesRouter.delete('/:venueId', deleteVenue);
venuesRouter.post('/:venueId/reaction/', addReactionToVenue);
venuesRouter.delete('/:venueId/reaction/', deleteReactionFromVenue);

/* TODO: update */

export = venuesRouter;
