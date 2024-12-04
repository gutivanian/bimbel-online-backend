const pool = require('../config/db.config');

// Get exam order by userName (exam_order contains shuffled exam names)
const getExamOrderByUserName = async (userName, scheduleId) => {
  try {
    const result = await pool.query('SELECT * FROM exam_orders WHERE user_name = $1 and exam_schedule_id = $2', [userName, scheduleId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching exam order:', error);
    throw error;
  }
};

// Insert a new exam order (using shuffled exam names)
const createExamOrder = async (userName, examOrder, scheduleId) => {
  try {
    const result = await pool.query(
      'INSERT INTO exam_orders (user_name, exam_order, exam_schedule_id) VALUES ($1, $2, $3) RETURNING *',
      [userName, examOrder, scheduleId],
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating exam order:', error);
    throw error;
  }
};

// Get exam names by array of exam IDs
const getExamNamesByIds = async (examIdList) => {
  try {
    const result = await pool.query(
      `SELECT name
       FROM exams
       WHERE id = ANY($1::int[])`,
      [examIdList]
    );
    return result.rows.map(row => row.name); // Return array of names
  } catch (error) {
    console.error('Error fetching exam names:', error);
    throw error;
  }
};

// Get exam details by shuffled exam names
const getExamDetailsByNames = async (examOrder) => {
  try {
    const result = await pool.query(
      `SELECT exam_string, name, duration
       FROM exams
       WHERE name = ANY($1::text[])
       ORDER BY array_position($1::text[], name)`,
      [examOrder]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching exam details:', error);
    throw error;
  }
};

// Get exam_id_list from exam_schedule by schedule ID
const getExamIdListFromSchedule = async (scheduleId) => {
  try {
    const result = await pool.query(
      `SELECT exam_id_list
       FROM exam_schedule
       WHERE id = $1`,
      [scheduleId]
    );
    return result.rows[0]; // Return the exam_id_list
  } catch (error) {
    console.error('Error fetching exam schedule:', error);
    throw error;
  }
};

module.exports = {
  getExamOrderByUserName,
  createExamOrder,
  getExamNamesByIds,
  getExamDetailsByNames,
  getExamIdListFromSchedule,
};
