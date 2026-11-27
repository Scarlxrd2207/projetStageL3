import { Router } from 'express';
import {
  getConversations,
  postOuvrir,
  getMessages,
  postMessage,
  postFichier,
} from '../controllers/conversation.controller';
import { televerserFichier } from '../utils/upload';

const router = Router();

router.get('/', getConversations);
router.post('/ouvrir', postOuvrir);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', postMessage);
router.post('/:id/fichiers', televerserFichier, postFichier);

export default router;