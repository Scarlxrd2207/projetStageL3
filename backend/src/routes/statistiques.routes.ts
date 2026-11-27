import { Router } from 'express';
import { getTableau } from '../controllers/statistiques.controller';

const router = Router();

router.get('/', getTableau);

export default router;