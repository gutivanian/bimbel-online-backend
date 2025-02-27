const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.controller');
const authenticateJWT = require('../middleware/authenticateToken');

// Route untuk mengambil semua pertanyaan
router.get('/',authenticateJWT, questionController.getAllQuestions);

router.get('/paged', authenticateJWT,questionController.getPagedQuestions);


// Route untuk mengambil pertanyaan berdasarkan exam_string
router.get('/byExamString',authenticateJWT, questionController.getQuestionsByExamString); // Route baru
router.get('/byExamId',authenticateJWT, questionController.getQuestionsByExamId); // Route baru

// Route untuk mengambil pertanyaan berdasarkan ID
router.get('/:id',authenticateJWT, questionController.getQuestionById);

// Route untuk membuat pertanyaan baru
router.post('/',authenticateJWT, questionController.createQuestion);
router.post('/bulk',authenticateJWT, questionController.createBulkQuestions);

// Route untuk memperbarui pertanyaan berdasarkan ID
router.put('/:id', authenticateJWT,questionController.updateQuestion);
router.put('/bulk', authenticateJWT, questionController.updateBulkQuestions);

router.delete('/:id',authenticateJWT, questionController.deleteQuestion);

module.exports = router; 
