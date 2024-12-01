import express from 'express';
import { getOrderbookByToken, createOrderReservation } from '../controllers/order-controller.mjs';

const router = express.Router();

router.route('/token/:tokenId').get(getOrderbookByToken);
router.route('/reserve').post(createOrderReservation);

export default router;
