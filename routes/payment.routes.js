// routes/payment.routes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

router.post('/create-transaction', paymentController.createTransaction);
router.post('/payment-notification', paymentController.paymentNotification);

module.exports = router;
