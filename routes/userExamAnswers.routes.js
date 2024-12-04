const express = require('express');
const router = express.Router();
const examController = require('../controllers/userExamAnswers.controller');

// Route to update score and answers
router.post('/updateScoreAndAnswers', examController.updateScoreAndAnswers);
router.post('/submit', examController.submitAnswers);

module.exports = router;
 