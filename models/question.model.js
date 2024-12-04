const pool = require('../config/db.config'); // Mengimpor konfigurasi pool

const getAllQuestions = async () => {
  try {
    const result = await pool.query('SELECT * FROM questions ORDER BY id');
    return result.rows;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

// Fungsi untuk mengambil pertanyaan berdasarkan exam_string
const getQuestionsByExamString = async (exam_string) => {
  try {
    // console.log("Starting getQuestionsByExamString");  // Log sebelum query
    // console.log("Exam string: ", exam_string);  // Log parameter yang diterima
    
    const examResult = await pool.query('SELECT * FROM exams WHERE exam_string = $1', [exam_string]);
    
    // console.log("Exam result:", examResult.rows);  // Log hasil query exam
    
    if (examResult.rows.length === 0) {
      throw new Error('Exam not found');
    }

    const examId = examResult.rows[0].id;  // Ini adalah integer
    // console.log("Exam ID: ", examId);  // Log ID ujian
    
    const questionsResult = await pool.query('SELECT * FROM questions WHERE exam_id = $1 ORDER BY id', [examId]);

    // console.log("Questions result: ", questionsResult.rows);  // Log hasil query questions

    return {
      duration: examResult.rows[0].duration,
      questions: questionsResult.rows.map(q => ({
        id: q.id,
        type: q.question_type,
        question: q.question_text,
        options: q.options,
        correct: q.correct_answer,
        statements: q.statements
      }))
    };
  } catch (error) {
    console.error('Error fetching questions by exam_string:', error);
    throw error;
  }
};

const getQuestionById = async (id) => {
  try {
    const result = await pool.query('SELECT * FROM questions WHERE id = $1', [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching question:', error);
    throw error;
  }
};

const createQuestion = async (questionData) => {
  const { exam_id, question_type, question_text, options, correct_answer, statements } = questionData;
  try {
    const result = await pool.query(
      'INSERT INTO questions (exam_id, question_type, question_text, options, correct_answer, statements) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [exam_id, question_type, question_text, options, correct_answer, statements]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
};

const updateQuestion = async (id, questionData) => {
  const { question_text, question_type, options, correct_answer, statements } = questionData;
  try {
    const result = await pool.query(
      'UPDATE questions SET question_text = $1, question_type = $2, options = $3::text[], correct_answer = $4::text[], statements = $5::text[] WHERE id = $6 RETURNING *',
      [question_text, question_type, options, correct_answer, statements, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

module.exports = {
  getAllQuestions,
  getQuestionsByExamString,  // Tambahkan fungsi baru di sini
  getQuestionById,
  createQuestion,
  updateQuestion
};
