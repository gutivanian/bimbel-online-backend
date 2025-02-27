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

const getPagedQuestions = async (filters) => {
  const {
    page = 1,
    limit = 50,
    search = '',
    question_type = 'All',
    exam_id,
    topic,
    subtopic,
    creator,
    start_date,
    end_date,
    sortKey = 'q.id',
    sortOrder = 'asc',
    userId,
  } = filters;

  const offset = (page - 1) * limit;

  // Define allowed sort keys to prevent SQL injection
  const allowedSortKeys = [
    'q.id',
    'exam_id',
    'exam_name',
    'question_type',
    'question_text',
    'correct_answer',
    'topic',
    'subtopic',
    'creator',
    'create_date',
    'editor',
    'edit_date'
  ];

  // Validate sortKey and sortOrder
  const validatedSortKey = allowedSortKeys.includes(sortKey) ? sortKey : 'q.id';
  const validatedSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  // Base SELECT and FROM clauses
  const baseSelectClause = `
    SELECT 
      q.id,
      q.exam_id,
      e.name AS exam_name,
      q.question_type,
      q.question_text,
      q.options,
      q.correct_answer,
      et.name AS subtopic,
      et2.name AS topic,
      COALESCE(u.name, 'admin') AS creator,
      q.create_date::date AS create_date,
      u2.name AS editor,
      q.edit_date::date AS edit_date
  `;

  const baseFromClause = `
    FROM questions q
    LEFT JOIN exams e ON e.id = q.exam_id
    LEFT JOIN v_dashboard_userdata u ON u.userid = q.create_user_id
    LEFT JOIN v_dashboard_userdata u2 ON u2.userid = q.edit_user_id
    LEFT JOIN exam_types et ON et.id = q.question_topic_type
    LEFT JOIN exam_types et2 ON et2.id = et.id
  `;

  // Initialize WHERE clauses
  let whereClauses = [];
  let values = [];
  let valueIndex = 1;
  let filterParamsCount = 0;

  if (search) {
    whereClauses.push(`(q.question_text ILIKE $${valueIndex} OR CAST(q.id AS TEXT) ILIKE $${valueIndex})`);
    values.push(`%${search}%`);
    valueIndex++;
    filterParamsCount++;
  }

  if (question_type && question_type !== 'All') {
    whereClauses.push(`q.question_type = $${valueIndex}`);
    values.push(question_type);
    valueIndex++;
    filterParamsCount++;
  }

  if (exam_id) {
    whereClauses.push(`q.exam_id = $${valueIndex}`);
    values.push(exam_id);
    valueIndex++;
    filterParamsCount++;
  }

  if (topic) {
    whereClauses.push(`et2.name = $${valueIndex}`);
    values.push(topic);
    valueIndex++;
    filterParamsCount++;
  }

  if (subtopic) {
    whereClauses.push(`et.name = $${valueIndex}`);
    values.push(subtopic);
    valueIndex++;
    filterParamsCount++;
  }

  if (creator) {
    whereClauses.push(`u.name = $${valueIndex}`);
    values.push(creator);
    valueIndex++;
    filterParamsCount++;
  }

  if (start_date) {
    whereClauses.push(`q.create_date::date >= $${valueIndex}`);
    values.push(start_date);
    valueIndex++;
    filterParamsCount++;
  }

  if (end_date) {
    whereClauses.push(`q.create_date::date <= $${valueIndex}`);
    values.push(end_date);
    valueIndex++;
    filterParamsCount++;
  }

  if (userId) {
    whereClauses.push(`(q.create_user_id = $${valueIndex} OR q.edit_user_id = $${valueIndex})`);
    values.push(userId);
    valueIndex++;
    filterParamsCount++;
  }

  // Construct WHERE clause
  let whereClause = whereClauses.length > 0 
    ? ' WHERE ' + whereClauses.join(' AND ')
    : '';

  // Construct the main query
  const mainQuery = `
    ${baseSelectClause}
    ${baseFromClause}
    ${whereClause}
    ORDER BY ${validatedSortKey} ${validatedSortOrder}
    LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
  `;
  values.push(limit, offset);

  // Construct the count query
  const countQuery = `
    SELECT COUNT(*) AS total
    FROM (
      SELECT q.id
      ${baseFromClause}
      ${whereClause}
    ) AS sub
  `;

  try {
    const [dataResult, countResult] = await Promise.all([
      pool.query(mainQuery, values),
      pool.query(countQuery, values.slice(0, filterParamsCount)),
    ]);

    const total = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit);

    return {
      data: dataResult.rows,
      total,
      totalPages,
    };
  } catch (error) {
    console.error('Error fetching paged questions:', error);
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
const getQuestionsByExamId = async (examId) => {
  try {

    const questionsResult = await pool.query('SELECT * FROM questions WHERE exam_id = $1 ORDER BY id', [examId]);
    return {
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
    console.error('Error fetching questions by examId:', error);
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

const createQuestion = async (questionData, create_user_id) => {
  const { exam_id, question_type, question_text, options, correct_answer, statements,question_topic_type } = questionData;
  try {

    const result = await pool.query(
      `INSERT INTO questions 
        (exam_id, question_type, question_text, options, correct_answer, statements, create_user_id, question_topic_type,edit_date) 
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, null) 
       RETURNING *`,
      [exam_id, question_type, question_text, options, correct_answer, statements, create_user_id, question_topic_type]
    );


    return result.rows[0];


  } catch (error) {
    console.error('Error creating question:', error);
    await pool.query(
      'ROLLBACK'
    )
    throw error;
  }
};

const createBulkQuestions = async (questions, create_user_id) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN'); // Start transaction
    
    const createdQuestions = [];
    
    // Prepare the query
    const insertQuery = `
      INSERT INTO questions 
        (exam_id, question_type, question_text, options, correct_answer, statements, create_user_id, question_topic_type, edit_date) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, null) 
      RETURNING *
    `;

    // Insert each question
    for (const question of questions) {
      const { 
        exam_id, 
        question_type, 
        question_text, 
        options, 
        correct_answer, 
        statements,
        question_topic_type 
      } = question;

      const result = await client.query(insertQuery, [
        exam_id,
        question_type,
        question_text,
        options,
        correct_answer,
        statements,
        create_user_id,
        question_topic_type
      ]);

      createdQuestions.push(result.rows[0]);
    }

    await client.query('COMMIT'); // Commit transaction
    return createdQuestions;

  } catch (error) {
    await client.query('ROLLBACK'); // Rollback on error
    console.error('Error in bulk question creation:', error);
    throw error;
  } finally {
    client.release();
  }
};


const updateQuestion = async (id, questionData, edit_user_id) => {
  const { 
    question_text, 
    question_type, 
    options, 
    correct_answer, 
    statements, 
    question_topic_type
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
         edit_date = NOW(),
         question_topic_type = $8
       WHERE id = $7 
       RETURNING *`,
      [question_text, question_type, options, correct_answer, statements, edit_user_id, id, question_topic_type]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

const updateBulkQuestions = async (questions, edit_user_id) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN'); // Start transaction
    
    const updatedQuestions = [];
    
    // Prepare the update query
    const updateQuery = `
      UPDATE questions 
      SET 
        exam_id = $1,
        question_type = $2,
        question_text = $3,
        options = $4,
        correct_answer = $5,
        statements = $6,
        edit_user_id = $7,
        question_topic_type = $8,
        edit_date = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;

    // Update each question
    for (const question of questions) {
      const { 
        id,
        exam_id, 
        question_type, 
        question_text, 
        options, 
        correct_answer, 
        statements,
        question_topic_type 
      } = question;

      const result = await client.query(updateQuery, [
        exam_id,
        question_type,
        question_text,
        options,
        correct_answer,
        statements,
        edit_user_id,
        question_topic_type,
        id
      ]);

      if (result.rows.length === 0) {
        throw new Error(`Question with ID ${id} not found`);
      }

      updatedQuestions.push(result.rows[0]);
    }

    await client.query('COMMIT'); // Commit transaction
    return updatedQuestions;

  } catch (error) {
    await client.query('ROLLBACK'); // Rollback on error
    console.error('Error in bulk question update:', error);
    throw error;
  } finally {
    client.release();
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
  updateBulkQuestions,
  createBulkQuestions,
  deleteQuestion,
  getQuestionsByExamId
};
