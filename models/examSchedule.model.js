const pool = require('../config/db.config');

// Get all valid exam schedules (is_valid = true)
const getValidExamSchedules = async () => {
  try {
    const result = await pool.query('SELECT * FROM exam_schedule WHERE is_valid = TRUE');
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Get a specific exam schedule by ID
const getExamScheduleById = async (id) => {
  try {
    const result = await pool.query('SELECT * FROM exam_schedule WHERE id = $1', [id]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get exam schedules by exam type
const getExamSchedulesByType = async (exam_type) => {
  try {
    const result = await pool.query('SELECT * FROM exam_schedule WHERE exam_type = $1', [exam_type]);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Create a new exam schedule
const createExamSchedule = async (name, description, exam_id_list, start_time, end_time, is_valid, created_by, exam_type) => {
  try {
    const result = await pool.query(
      `INSERT INTO exam_schedule (name, description, exam_id_list, start_time, end_time, is_valid, created_by, exam_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, description, exam_id_list, start_time, end_time, is_valid, created_by, exam_type]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Update an existing exam schedule by ID
const updateExamSchedule = async (id, name, description, exam_id_list, start_time, end_time, is_valid, updated_by, exam_type) => {
  try {
    const result = await pool.query(
      `UPDATE exam_schedule 
       SET name = $1, description = $2, exam_id_list = $3, start_time = $4, end_time = $5, is_valid = $6, updated_by = $7, update_date = NOW(), exam_type = $8
       WHERE id = $9 RETURNING *`,
      [name, description, exam_id_list, start_time, end_time, is_valid, updated_by, exam_type, id]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Delete an exam schedule by ID
const deleteExamSchedule = async (id) => {
  try {
    const result = await pool.query('DELETE FROM exam_schedule WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};



/**
 * Fungsi untuk memeriksa apakah pengguna memiliki akses ke ujian tertentu
 * @param {string} username - Username pengguna
 * @param {number} examId - ID ujian yang ingin diakses
 * @returns {Object} - Objek yang mengandung status akses (accessGranted: true/false)
 */
const checkAccess = async (username, examId) => {
  try {
    // Query untuk memeriksa apakah pengguna sudah membeli produk terkait ujian
    const result = await pool.query(
      `SELECT es.id, es.isfree, up.username
       FROM exam_schedule es
       LEFT JOIN userproduct up
       ON es.id = up.product_id AND up.username = $1
       WHERE es.id = $2`,
      [username, examId]
    );

    // Jika tidak ada ujian ditemukan, lempar error
    if (result.rows.length === 0) {
      throw new Error('Exam not found');
    }

    const exam = result.rows[0];

    // Jika ujian gratis, akses diberikan langsung
    if (exam.isfree) {
      return { accessGranted: true };
    }

    // Jika ujian tidak gratis, cek apakah pengguna memiliki produk
    if (exam.isfree === false && exam.username) {
      return { accessGranted: true };
    }

    // Jika tidak ada produk yang dibeli, akses ditolak
    return { accessGranted: false };
  } catch (error) {
    throw error;
  }
};


module.exports = {
  checkAccess,
  getValidExamSchedules,
  getExamScheduleById,
  getExamSchedulesByType,
  createExamSchedule,
  updateExamSchedule,
  deleteExamSchedule,
};
