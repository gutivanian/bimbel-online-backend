const express = require('express');
const router = express.Router();
const userExamController = require('../controllers/userExam.controller');

// POST route for checking user exam
router.post('/checkUserExam', userExamController.checkUserExam);
// router.post('/submit', userExamAnswerController.submitAnswers);


module.exports = router;
