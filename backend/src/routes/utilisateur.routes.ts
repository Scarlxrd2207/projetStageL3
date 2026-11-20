import { Router } from 'express';
import { postCreerPresident } from '../controllers/utilisateur.controller';

const router = Router();

router.post('/presidents', postCreerPresident);

export default router;