import { Router } from 'express';
import { getStock, getStockSoam, getStockDetail } from '../controllers/stock.controller';

const router = Router();

router.get('/', getStock);
router.get('/soam', getStockSoam);
router.get('/detail', getStockDetail);

export default router;