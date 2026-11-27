import { Router } from 'express';
import {
  getRecoltes,
  getRecoltesDisponibles,
  getRecolte,
  postRecolte,
  putRecolte,
  deleteRecolte,
} from '../controllers/recolte.controller';

const router = Router();

router.get('/', getRecoltes);

// Doit rester avant '/:id' : sinon « disponibles » est pris pour un identifiant
router.get('/disponibles', getRecoltesDisponibles);

router.get('/:id', getRecolte);
router.post('/', postRecolte);
router.put('/:id', putRecolte);
router.delete('/:id', deleteRecolte);

export default router;