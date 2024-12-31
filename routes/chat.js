import { Router } from 'express';
import { postChat } from '../controllers/chat.js';

const router = Router();

router.post('/', postChat);

export default router;