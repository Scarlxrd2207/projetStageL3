import { Router } from 'express';
import {
  getConversations,
  postOuvrir,
  getMessages,
  postMessage,
<<<<<<< HEAD
  postFichier,
} from '../controllers/conversation.controller';
import { televerserFichier } from '../utils/upload';
=======
} from '../controllers/conversation.controller';
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

const router = Router();

router.get('/', getConversations);
router.post('/ouvrir', postOuvrir);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', postMessage);
<<<<<<< HEAD
router.post('/:id/fichiers', televerserFichier, postFichier);
=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

export default router;