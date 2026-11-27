import { Router } from 'express';
import { getDashboardPresident, getDashboardResponsable } from '../controllers/dashboard.controller';

const router = Router();

router.get('/president', getDashboardPresident);
router.get('/responsable', getDashboardResponsable);

export default router;