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

// models/examModel.js

const searchExams = async (query, limit, userId) => {
  try {
    // Start constructing the query
    let sql = `
      SELECT id, name, duration
      FROM exams
    `;
    
    // Initialize WHERE clauses and values
    let whereClauses = [];
    let values = [];
    let valueIndex = 1;
    
    if (query) {
      whereClauses.push(`(name ILIKE $${valueIndex} OR CAST(id AS TEXT) ILIKE $${valueIndex})`);
      values.push(`%${query}%`);
      valueIndex++;
    }

    if (userId) {
      whereClauses.push(`edit_user_id = $${valueIndex}`);
      values.push(userId);
      valueIndex++;
    }

    // Append WHERE clauses if any
    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }

    // Append ORDER BY and LIMIT
    sql += `
      ORDER BY id ASC
      LIMIT $${valueIndex}
    `;
    values.push(limit);

    console.log(sql)

    const result = await pool.query(sql, values);
    return result.rows;
  } catch (error) {
    console.error('Error searching exams:', error);
    throw error;
  }
};



const createExam = async (examData) => {
  const { exam_string, name, duration, create_user_id } = examData;
  try {
    const result = await pool.query(
      `INSERT INTO exams (exam_string, name, duration, create_user_id, create_date)
       VALUES ($1, $2, $3, $4, NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta')
       RETURNING *`,
      [exam_string, name, duration, create_user_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating exam:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan exams berdasarkan IDs
const getExamsByIds = async (examIds) => {
  try {
    const query = `
      SELECT id, name
      FROM exams
      WHERE id = ANY($1::int[])
      ORDER BY id ASC
    `;
    const result = await pool.query(query, [examIds]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching exams by IDs:', error);
    throw error;
  }
};

const updateExam = async (examData) => {
  const { id, name, duration, edit_user_id } = examData;

  try {
    const result = await pool.query(
      `UPDATE exams
       SET name = $1, duration = $2, edit_user_id = $3, edit_date = NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta'
       WHERE id = $4
       RETURNING *`,
      [name, duration, edit_user_id, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating exam:', error); 
    throw error;
  }
};

module.exports = {
  getExamByString,
  createExam,
  searchExams,
  getExamsByIds,
  updateExam
};
 