import { Router } from 'express';
import { postTransformation } from '../controllers/transformation.controller';

const router = Router();

router.post('/', postTransformation);

export default router;