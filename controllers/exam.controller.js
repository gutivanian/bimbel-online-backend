const examModel = require('../models/exam.model');

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

module.exports = {
  getExamByString,
  createExam,
};
 