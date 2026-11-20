import { Router } from 'express';
import {
  getMembres,
  getMembre,
  postMembre,
  putMembre,
  putDesactiverMembre,
} from '../controllers/membre.controller';

const router = Router();

router.get('/', getMembres);
router.get('/:id', getMembre);
router.post('/', postMembre);
router.put('/:id', putMembre);
router.put('/:id/desactiver', putDesactiverMembre);

export default router;