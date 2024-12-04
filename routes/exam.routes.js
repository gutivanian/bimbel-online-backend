const express = require('express');
const router = express.Router();
const examController = require('../controllers/exam.controller');

// Get exam by exam_string
router.get('/:exam_string', examController.getExamByString);

// Create a new exam
router.post('/', examController.createExam);

module.exports = router;
