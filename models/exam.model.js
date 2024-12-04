const pool = require('../config/db.config');

// Get exam by exam_string
const getExamByString = async (examString) => {
  try {
    const result = await pool.query('SELECT * FROM exams WHERE exam_string = $1', [examString]);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching exam:', error);
    throw error;
  }
};

// Create a new exam
const createExam = async (examData) => {
  const { exam_string, name, duration } = examData;
  try {
    const result = await pool.query(
      'INSERT INTO exams (exam_string, name, duration) VALUES ($1, $2, $3) RETURNING *',
      [exam_string, name, duration]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating exam:', error);
    throw error;
  }
};

module.exports = {
  getExamByString,
  createExam,
};
