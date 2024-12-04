const express = require('express');
const router = express.Router();
const { getPayments, createPayment, checkTransactionStatus,handleWebhook } = require('../controllers/payment.controller');

router.get('/', getPayments);
router.post('/', createPayment);
router.get('/:order_number', checkTransactionStatus);
router.post('/midtrans-notification', handleWebhook);

module.exports = router;
