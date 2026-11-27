import { Router } from 'express';
import { getNotifications, getCompteurs } from '../controllers/notification.controller';

const router = Router();

router.get('/', getNotifications);
router.get('/compteurs', getCompteurs);

export default router;