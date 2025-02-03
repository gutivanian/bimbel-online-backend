const questionModel = require('../models/question.model');

// Handler untuk mengambil semua pertanyaan
const getAllQuestions = async (req, res) => {
  try {
    const questions = await questionModel.getAllQuestions();
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

// Handler untuk mengambil semua pertanyaan dengan pagination dan search
// controllers/questionController.js

const getPagedQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', type = 'All', examId = '', userId = null } = req.query;
    const offset = (page - 1) * limit;

    const questions = await questionModel.getPagedQuestions({ limit, offset, search, type, examId, userId });
    const total = await questionModel.getTotalQuestions({ search, type, examId, userId });
  
    console.log('limit',limit)
    console.log('pages',Math.ceil(total / limit))
    // console.log(questions)
    res.status(200).json({
      data: questions,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};


// Handler untuk mengambil pertanyaan berdasarkan exam_string
const getQuestionsByExamString = async (req, res) => {
  // console.log("Request query:", req.query);  // Log parameter dari request
  const examString = req.query.exam_string; // Ambil exam_string dari query string
  
  // console.log("Exam string in controller:", examString);  // Log untuk memastikan exam_string diterima

  try {
    const questions = await questionModel.getQuestionsByExamString(examString);
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions by exam_string:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};


// Handler untuk mengambil pertanyaan berdasarkan ID
const getQuestionById = async (req, res) => {
  const id = req.params.id;
  try {
    const question = await questionModel.getQuestionById(id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.status(200).json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
};
 
const createQuestion = async (req, res) => {
  const questionData = req.body;
  const { create_user_id } = questionData; // Destructure create_user_id

  // Optionally, validate the user ID
  if (!create_user_id) {
    return res.status(400).json({ error: 'create_user_id is required' });
  }

  try {
    const newQuestion = await questionModel.createQuestion(questionData);
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
};

// Handler untuk memperbarui pertanyaan berdasarkan ID
const updateQuestion = async (req, res) => {
  const questionId = req.params.id;
  const questionData = req.body;
  
  // Pastikan edit_user_id dikirim dari frontend
  const { edit_user_id } = questionData;
  if (!edit_user_id) {
    return res.status(400).json({ error: 'edit_user_id is required' });
  }

  try {
    const updatedQuestion = await questionModel.updateQuestion(questionId, questionData);
    if (!updatedQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
};

const deleteQuestion = async (req, res) => {
  const questionId = req.params.id;

  try {
    const deletedQuestion = await questionModel.deleteQuestion(questionId);
    if (!deletedQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully', question: deletedQuestion });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
};

module.exports = {
  getAllQuestions,
  getPagedQuestions,
  getQuestionsByExamString,  // Tambahkan handler baru di sini
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion
};
