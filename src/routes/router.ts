/** source/routes/posts.ts */
import express from 'express';
import { createGroup, getGroup } from '../controllers/groupController';
import { createReaction } from '../controllers/reactionController';
import { createUser, deleteUser, getUser } from '../controllers/userController';
import {
  createVenue,
  deleteVenue,
  getVenue,
} from '../controllers/venueController';
const router = express.Router();

/* User Controller */
router.post('/user', createUser);
router.get('/user/:userId', getUser);
router.delete('/user/:userId', deleteUser);

/* Group Controller */
router.post('/group', createGroup);
router.get('/group/:groupId', getGroup);

/* Venue Controller */
router.post('/venue', createVenue);
router.get('/venue/:venueId', getVenue);
router.delete('/venue/:venueId', deleteVenue);

/* Reaction Controller */
router.post('/reaction', createReaction);

export = router;
