const express = require('express');
const router = express.Router();
const examOrderController = require('../controllers/examOrder.controller');

// Route to get or create exam order
router.post('/getExamOrder', examOrderController.getExamOrder);

module.exports = router;
