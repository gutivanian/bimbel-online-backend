const express = require('express');
const router = express.Router();
const { getOrders, createOrder, getOrderByNumber } = require('../controllers/orders.controller');

router.get('/', getOrders);
router.post('/', createOrder);
router.get('/details/:orderNumber', getOrderByNumber);

module.exports = router;
