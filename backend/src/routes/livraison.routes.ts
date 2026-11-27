import { Router } from 'express';
import { getLivraisons, postConfirmerLivraison } from '../controllers/livraison.controller';

const router = Router();

router.get('/', getLivraisons);
router.post('/:id/confirmer', postConfirmerLivraison);

export default router;