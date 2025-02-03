// models/roleModel.js
const db = require('../config/db.config');

/**
 * Cari role berdasarkan nama dengan pencarian case-insensitive.
 * @param {string} searchTerm - Term pencarian.
 * @returns {Promise<Array>} - Array role yang cocok.
 */
const searchRoles = async (searchTerm) => {
  const query = `
    SELECT id, role
    FROM dimroles
    WHERE role ILIKE $1 OR description ILIKE $1
    ORDER BY role ASC
    LIMIT 10
  `;
  const values = [`%${searchTerm}%`];
  
  try {
    const res = await db.query(query, values);
    return res.rows;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  searchRoles,
};
