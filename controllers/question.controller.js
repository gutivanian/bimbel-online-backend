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
 
// Handler untuk membuat pertanyaan baru
const createQuestion = async (req, res) => {
  const questionData = req.body;
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
 
module.exports = {
  getAllQuestions,
  getQuestionsByExamString,  // Tambahkan handler baru di sini
  getQuestionById,
  createQuestion,
  updateQuestion,
};
