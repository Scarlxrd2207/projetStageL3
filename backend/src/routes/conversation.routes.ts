import { Router } from 'express';
import {
  getConversations,
  postOuvrir,
  getMessages,
  postMessage,
} from '../controllers/conversation.controller';

const router = Router();

router.get('/', getConversations);
router.post('/ouvrir', postOuvrir);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', postMessage);

export default router;