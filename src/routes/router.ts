/** source/routes/posts.ts */
import express from 'express';
import { createUser } from '../controllers/controller';
const router = express.Router();

router.post('/user', createUser);

export = router;
