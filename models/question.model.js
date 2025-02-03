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


// models/questionModel.js

const getPagedQuestions = async ({ limit, offset, search, type, examId, userId }) => {
  try {
    let query = `
      SELECT q.id, q.exam_id, e.name AS exam_name, q.question_type, q.question_text, q.options, q.correct_answer
      FROM questions q
      LEFT JOIN exams e ON e.id = q.exam_id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Filter berdasarkan search
    if (search) {
      query += ` AND (q.question_text ILIKE $${paramIndex} OR CAST(q.id AS TEXT) ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Filter berdasarkan type
    if (type && type !== 'All') {
      query += ` AND q.question_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    // Filter berdasarkan examId
    if (examId) {
      query += ` AND q.exam_id = $${paramIndex}`;
      params.push(examId);
      paramIndex++;
    }

    // Filter berdasarkan userId
    if (userId) {
      query += ` AND (q.create_user_id = $${paramIndex} OR q.edit_user_id = $${paramIndex})`;
      params.push(userId);
      paramIndex++;
    }

    // Sorting (misalnya, berdasarkan id ASC)
    query += ` ORDER BY q.id ASC`;

    // Pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching paginated questions:', error);
    throw error;
  }
};

const getTotalQuestions = async ({ search, type, examId, userId }) => {
  try {
    let query = `
      SELECT COUNT(*) AS total
      FROM questions q
      LEFT JOIN exams e ON e.id = q.exam_id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Filter berdasarkan search
    if (search) {
      query += ` AND (q.question_text ILIKE $${paramIndex} OR CAST(q.id AS TEXT) ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Filter berdasarkan type
    if (type && type !== 'All') {
      query += ` AND q.question_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    // Filter berdasarkan examId
    if (examId) {
      query += ` AND q.exam_id = $${paramIndex}`;
      params.push(examId);
      paramIndex++;
    }

    // Filter berdasarkan userId
    if (userId) {
      query += ` AND (q.create_user_id = $${paramIndex} OR q.edit_user_id = $${paramIndex})`;
      params.push(userId);
      paramIndex++;
    }

    const result = await pool.query(query, params);
    console.log(parseInt(result.rows[0].total, 10))
    return parseInt(result.rows[0].total, 10);
  } catch (error) {
    console.error('Error fetching total questions:', error);
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
  const { exam_id, question_type, question_text, options, correct_answer, statements, create_user_id } = questionData;
  try {
    const result = await pool.query(
      `INSERT INTO questions 
        (exam_id, question_type, question_text, options, correct_answer, statements, create_user_id) 
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [exam_id, question_type, question_text, options, correct_answer, statements, create_user_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
};


const updateQuestion = async (id, questionData) => {
  const { 
    question_text, 
    question_type, 
    options, 
    correct_answer, 
    statements, 
    edit_user_id 
  } = questionData;
  
  try {
    const result = await pool.query(
      `UPDATE questions 
       SET 
         question_text = $1, 
         question_type = $2, 
         options = $3::text[], 
         correct_answer = $4::text[], 
         statements = $5::text[],
         edit_user_id = $6,
         edit_date = NOW()
       WHERE id = $7 
       RETURNING *`,
      [question_text, question_type, options, correct_answer, statements, edit_user_id, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

const deleteQuestion = async (id) => {
  try {
    const result = await pool.query(
      'DELETE FROM questions WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

module.exports = {
  getAllQuestions,
  getPagedQuestions,
  getTotalQuestions,  // Tambahkan fungsi baru di sini
  getQuestionsByExamString,  // Tambahkan fungsi baru di sini
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion
};
