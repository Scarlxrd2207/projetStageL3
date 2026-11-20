import { Router } from 'express';
import {
  getCommandes,
  getCommande,
  postCommande,
  postAccepterCommande,
  postRefuserCommande,
} from '../controllers/commande.controller';

const router = Router();

router.get('/', getCommandes);
router.get('/:id', getCommande);
router.post('/', postCommande);
router.post('/:id/accepter', postAccepterCommande);
router.post('/:id/refuser', postRefuserCommande);

export default router;