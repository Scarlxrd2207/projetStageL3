import { Router } from 'express';
import { postFacture } from '../controllers/facture.controller';

const router = Router();

router.post('/', postFacture);

export default router;