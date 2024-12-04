const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');

router.get('/pending', transactionController.getPendingTransactions);

module.exports = router;
