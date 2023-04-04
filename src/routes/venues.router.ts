import express from 'express';
import {
  createVenue,
  getVenue,
  deleteVenue,
  addReactionToVenue,
  deleteReactionFromVenue,
  updateVenue,
  getVenues,
} from '../controllers/venue.controller';

const venuesRouter = express.Router();

/* Venue Controller */
venuesRouter.post('/', createVenue);
venuesRouter.get('/:venueId', getVenue);
venuesRouter.get('/', getVenues);
venuesRouter.delete('/:venueId', deleteVenue);

// TODO - Change to patch
venuesRouter.post('/:venueId/reaction', addReactionToVenue);
venuesRouter.delete('/:venueId/reaction', deleteReactionFromVenue);
venuesRouter.patch('/:venueId', updateVenue);

export = venuesRouter;
