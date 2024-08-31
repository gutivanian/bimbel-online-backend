// services/userTryoutTestService.js

const pool = require('../config/db.config');

// Check if a user tryout test record exists
exports.checkUserTest = async (user_id, test_id) => {
  const query = 'SELECT * FROM user_tryout_tests WHERE user_id = $1 AND test_id = $2';
  const values = [user_id, test_id];

  try {
    const result = await pool.query(query, values);
    return result.rows[0]; // Return the first record or undefined
  } catch (error) {
    throw error;
  }
};

exports.checkUserTestByTestName = async (user_id, test_name) => {
  console.log(test_name);
  const query = 'SELECT * FROM user_tryout_tests AS ute LEFT JOIN test  AS t ON t.id = ute.test_id WHERE ute.user_id = $1 AND t.name = $2';
  const values = [user_id, test_name];

  try {
    const result = await pool.query(query, values);
    return result.rows[0]; // Return the first record or undefined
  } catch (error) {
    throw error;
  }
};

// Create a new user tryout test record
exports.createUserTest = async (user_id, test_id, test_array) => {
  const query = `
    INSERT INTO user_tryout_tests (user_id, test_id, test_array)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const values = [user_id, test_id, test_array];

  try {
    const result = await pool.query(query, values);
    return result.rows[0]; // Return the newly created record
  } catch (error) {
    throw error;
  }
};
