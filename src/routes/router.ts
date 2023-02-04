/** source/routes/posts.ts */
import express from 'express';
import { postUser } from '../controllers/controller';
const router = express.Router();

router.post('/user', postUser);

export = router;
