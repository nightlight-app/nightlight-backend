/** source/routes/posts.ts */
import express from 'express';
import { createGroup, getGroup } from '../controllers/groupController';
import { createUser, getUser } from '../controllers/userController';
const router = express.Router();

/* User Controller */
router.post('/user', createUser);
router.get('/user/:userId', getUser);

/* Group Controller */
router.post('/group', createGroup);
router.get('/group/:groupId', getGroup);

export = router;
