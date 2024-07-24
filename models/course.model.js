require('dotenv').config();
const pool = require('../config/db.config');

const Course = {
  getAll: async () => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM courses ORDER BY title');
      return result.rows;
    } finally {
      client.release();
    }
  },

  create: async (course) => {
    const { title, description, imageUrl } = course;
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO courses (title, description, imageUrl) VALUES ($1, $2, $3) RETURNING id',
        [title, description, imageUrl]
      );
      const courseId = result.rows[0].id;
      const baseUrl = process.env.BASE_URL || '';
      const courseUrl = `${baseUrl}/courses/${courseId}`;
      const updateResult = await client.query(
        'UPDATE courses SET courseUrl = $1 WHERE id = $2 RETURNING *',
        [courseUrl, courseId]
      );
      return updateResult.rows[0];
    } finally {
      client.release();
    }
  },

  update: async (id, course) => {
    const { title, description, imageUrl } = course;
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE courses SET title = $1, description = $2, imageUrl = $3 WHERE id = $4 RETURNING *',
        [title, description, imageUrl, id]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  delete: async (id) => {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM courses WHERE id = $1', [id]);
    } finally {
      client.release();
    }
  }
};

module.exports = Course;
