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
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
      search: req.query.search || '',
      question_type: req.query.question_type || 'All',
      exam_id: req.query.exam_id || null,
      topic: req.query.topic || null,
      subtopic: req.query.subtopic || null,
      creator: req.query.creator || null,
      start_date: req.query.start_date || null,
      end_date: req.query.end_date || null,
      sortKey: req.query.sortKey || 'q.id',
      sortOrder: req.query.sortOrder || 'asc',
      userId: req.query.userId || null,
    };

    const result = await questionModel.getPagedQuestions(filters);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getQuestions controller:', error);
    res.status(500).json({ message: 'Internal Server Error' });
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

const getQuestionsByExamId = async (req, res) => {
  // console.log("Request query:", req.query);  // Log parameter dari request
  const examId = req.query.examid; // Ambil exam_string dari query string
  
  // console.log("Exam string in controller:", examString);  // Log untuk memastikan exam_string diterima

  try {
    const questions = await questionModel.getQuestionsByExamId(examId);
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
  const create_user_id  = req.user.id; // Destructure create_user_id

  // Optionally, validate the user ID
  if (!create_user_id) {
    return res.status(400).json({ error: 'create_user_id is required' });
  }

  try {
    const newQuestion = await questionModel.createQuestion(questionData,create_user_id);
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
};
const createBulkQuestions = async (req, res) => {
  const { questions } = req.body; // Expecting an array of questions
  const create_user_id = req.user.id;

  // Validate input
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Questions array is required and must not be empty' });
  }

  if (!create_user_id) {
    return res.status(400).json({ error: 'create_user_id is required' });
  }

  try {
    // Create all questions in a transaction
    const newQuestions = await questionModel.createBulkQuestions(questions, create_user_id);
    res.status(201).json(newQuestions);
  } catch (error) {
    console.error('Error creating bulk questions:', error);
    res.status(500).json({ error: 'Failed to create questions in bulk' });
  }
};

// Handler untuk memperbarui pertanyaan berdasarkan ID
const updateQuestion = async (req, res) => {
  const questionId = req.params.id;
  const questionData = req.body;
  
  // Pastikan edit_user_id dikirim dari frontend
  const edit_user_id  = req.user.id;
  if (!edit_user_id) {
    return res.status(400).json({ error: 'edit_user_id is required' });
  }

  try {
    const updatedQuestion = await questionModel.updateQuestion(questionId, questionData, edit_user_id);
    if (!updatedQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
};

const updateBulkQuestions = async (req, res) => {
  const { questions } = req.body; // Expecting an array of questions
  const edit_user_id = req.user.id;

  // Validate input
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Questions array is required and must not be empty' });
  }

  if (!edit_user_id) {
    return res.status(400).json({ error: 'edit_user_id is required' });
  }

  // Validate that each question has an ID
  const missingIds = questions.some(q => !q.id);
  if (missingIds) {
    return res.status(400).json({ error: 'All questions must have an ID for bulk update' });
  }

  try {
    const updatedQuestions = await questionModel.updateBulkQuestions(questions, edit_user_id);
    res.status(200).json(updatedQuestions);
  } catch (error) {
    console.error('Error updating bulk questions:', error);
    res.status(500).json({ error: 'Failed to update questions in bulk' });
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
  createBulkQuestions,
  createQuestion,
  updateQuestion,
  updateBulkQuestions,
  deleteQuestion,
  getQuestionsByExamId
};
