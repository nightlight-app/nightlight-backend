/** source/routes/posts.ts */
import express from 'express';
import { addMessage } from '../controllers/controller';
const router = express.Router();


router.post('/posts', addMessage);

export = router;
