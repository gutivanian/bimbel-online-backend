    const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.controller');
 
// Route untuk mengambil semua pertanyaan
router.get('/', questionController.getAllQuestions);

router.get('/paged', questionController.getPagedQuestions);


// Route untuk mengambil pertanyaan berdasarkan exam_string
router.get('/byExamString', questionController.getQuestionsByExamString); // Route baru

// Route untuk mengambil pertanyaan berdasarkan ID
router.get('/:id', questionController.getQuestionById);

// Route untuk membuat pertanyaan baru
router.post('/', questionController.createQuestion);

// Route untuk memperbarui pertanyaan berdasarkan ID
router.put('/:id', questionController.updateQuestion);
 
router.delete('/:id', questionController.deleteQuestion);

module.exports = router; 
