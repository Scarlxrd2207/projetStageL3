import { Router } from 'express';
import {
  getRecoltes,
  getRecolte,
  postRecolte,
  putRecolte,
  deleteRecolte,
} from '../controllers/recolte.controller';

const router = Router();

router.get('/', getRecoltes);
router.get('/:id', getRecolte);
router.post('/', postRecolte);
router.put('/:id', putRecolte);
router.delete('/:id', deleteRecolte);

export default router;