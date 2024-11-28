import express from 'express';
import { getOrderbookByToken } from '../controllers/order-controller.mjs';

const router = express.Router();

router.route('/token/:tokenId').get(getOrderbookByToken);

export default router;
