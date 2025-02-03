const examModel = require('../models/exam.model');

// controllers/examController.js

const searchExams = async (req, res) => {
  const { query, limit = 10, userId = null } = req.query; // Extract userId

  try { 
    const exams = await examModel.searchExams(query, parseInt(limit, 10), userId);
    res.status(200).json({ data: exams });
  } catch (error) {
    console.error('Error searching exams:', error);
    res.status(500).json({ error: 'Failed to search exams' });
  }
};

// Get exam by exam_string
const getExamByString = async (req, res) => {
  const { exam_string } = req.params;
  try {
    const exam = await examModel.getExamByString(exam_string);
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    res.status(200).json(exam);
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({ error: 'Failed to fetch exam' });
  }
};

// Create a new exam
const createExam = async (req, res) => {
  const examData = req.body;
  try {
    const newExam = await examModel.createExam(examData);
    res.status(201).json(newExam);
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ error: 'Failed to create exam' });
  }
};

const getExamsByIds = async (req, res) => {
  const { ids } = req.query;

  if (!ids) {
    return res.status(400).json({ error: 'Missing ids parameter' });
  }

  let examIds = [];

  // IDs dapat datang sebagai array atau string tergantung query
  if (Array.isArray(ids)) {
    examIds = ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
  } else if (typeof ids === 'string') {
    // Jika hanya satu ID yang dikirim sebagai string
    const parsedId = parseInt(ids, 10);
    if (!isNaN(parsedId)) {
      examIds.push(parsedId);
    }
  }

  if (examIds.length === 0) {
    return res.status(400).json({ error: 'Invalid or empty ids parameter' });
  }

  try {
    const exams = await examModel.getExamsByIds(examIds);
    res.status(200).json({ data: exams });
  } catch (error) {
    console.error('Error fetching exams by IDs:', error);
    res.status(500).json({ error: 'Failed to fetch exams by IDs' });
  }
};

const updateExam = async (req, res) => {
  const { id } = req.params;
  const { name, duration, edit_user_id } = req.body;

  if (!id || !name || !duration || !edit_user_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const updatedExam = await examModel.updateExam({
      id,
      name,
      duration,
      edit_user_id,
    });

    if (!updatedExam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    res.status(200).json(updatedExam);
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).json({ error: 'Failed to update exam' });
  }
};

 
module.exports = {
  getExamByString,
  createExam,
  searchExams,
  getExamsByIds, 
  updateExam 
}; 
 