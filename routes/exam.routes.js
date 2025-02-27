const express = require('express');
const router = express.Router();
const examController = require('../controllers/exam.controller');

router.get('/', examController.getExamsByIds);

router.get('/search', examController.searchExams);

// Get exam by exam_string
router.get('/:exam_string', examController.getExamByString);

// Create a new exam
router.post('/', examController.createExam);
// Update exam route
router.put('/:id', examController.updateExam);

// Search exams


module.exports = router;
