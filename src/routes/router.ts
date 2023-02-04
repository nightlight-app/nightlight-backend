/** source/routes/posts.ts */
import express from 'express';
import { createUser, getUser } from '../controllers/controller';
const router = express.Router();

router.post('/user', createUser);
router.get('/user/:userId', getUser);

export = router;
