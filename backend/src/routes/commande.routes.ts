import { Router } from 'express';
import {
  getCommandes,
  getCommande,
  postCommande,
  postAccepterCommande,
  postRefuserCommande,
  postPaiement,
} from '../controllers/commande.controller';

const router = Router();

router.get('/', getCommandes);
router.get('/:id', getCommande);
router.post('/', postCommande);
router.post('/:id/accepter', postAccepterCommande);
router.post('/:id/refuser', postRefuserCommande);
router.post('/:id/paiement', postPaiement);

export default router;