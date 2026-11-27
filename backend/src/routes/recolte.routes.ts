import { Router } from 'express';
import {
  getRecoltes,
<<<<<<< HEAD
  getRecoltesDisponibles,
=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  getRecolte,
  postRecolte,
  putRecolte,
  deleteRecolte,
} from '../controllers/recolte.controller';

const router = Router();

router.get('/', getRecoltes);
<<<<<<< HEAD

// Doit rester avant '/:id' : sinon « disponibles » est pris pour un identifiant
router.get('/disponibles', getRecoltesDisponibles);

=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
router.get('/:id', getRecolte);
router.post('/', postRecolte);
router.put('/:id', putRecolte);
router.delete('/:id', deleteRecolte);

export default router;