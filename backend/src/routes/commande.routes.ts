import { Router } from 'express';
import {
  getCommandes,
  getCommande,
  postCommande,
  postAccepterCommande,
  postRefuserCommande,
<<<<<<< HEAD
  postPaiement,
=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
} from '../controllers/commande.controller';

const router = Router();

router.get('/', getCommandes);
router.get('/:id', getCommande);
router.post('/', postCommande);
router.post('/:id/accepter', postAccepterCommande);
router.post('/:id/refuser', postRefuserCommande);
<<<<<<< HEAD
router.post('/:id/paiement', postPaiement);
=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

export default router;