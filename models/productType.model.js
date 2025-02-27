// models/productTypeModel.js
const pool = require('../config/db.config');

const getProductTypes = async (filters) => {
    const { group_product, series, exam_type } = filters;
  
    const baseQuery = `
      SELECT description AS exam_type, series, group_product 
      FROM product_type
      WHERE 1 = 1
    `;
  
    let whereClauses = [];
    let values = [];
    let valueIndex = 1;
  
    if (group_product) {
      whereClauses.push(`group_product ILIKE $${valueIndex}`);
      values.push(`%${group_product}%`);
      valueIndex++;
    }
  
    if (series) {
      whereClauses.push(`series ILIKE $${valueIndex}`);
      values.push(`%${series}%`);
      valueIndex++;
    }
  
    if (exam_type) {
      whereClauses.push(`description ILIKE $${valueIndex}`);
      values.push(`%${exam_type}%`);
      valueIndex++;
    }
  
    if (whereClauses.length > 0) {
      const whereClause = ' AND ' + whereClauses.join(' AND ');
      return pool.query(baseQuery + whereClause, values);
    }
  
    return pool.query(baseQuery, values);
  };
  
// Model untuk mencari Group Product
const getGroupProducts = async (search) => {
  const query = `
    SELECT DISTINCT group_product 
    FROM product_type
    WHERE group_product ILIKE $1
    LIMIT 5;
  `;

  const result = await pool.query(query, [`%${search}%`]);
  return result.rows;
};

// Model untuk mencari Series berdasarkan Group Product
const getSeries = async (groupProduct, search) => {
    
    let query = `SELECT DISTINCT series FROM product_type WHERE 1 = 1`;
    let values = [];
    let parameterIndex = 1;
    
    // Check if groupProduct exists and is not 'All'
    if (groupProduct && groupProduct !== 'All') {
        query += ` AND group_product = $${parameterIndex}::VARCHAR`;
        values.push(groupProduct);
        parameterIndex++;
    }
    
    // Check if search exists
    if (search) {
        query += ` AND series ILIKE $${parameterIndex}::TEXT`;
        values.push(`%${search}%`);
    }
    
    query += ` LIMIT 5`;
    
    try {
        const result = await pool.query(query, values);
        return result.rows;
    } catch (error) {
        console.error('Error fetching series:', error);
        throw error;
    }
};
  
  
  

// Model untuk mencari Exam Type berdasarkan Group Product dan Series
const getExamTypes = async (groupProduct, series, search) => {
    let query = `SELECT DISTINCT id, description AS exam_type FROM product_type WHERE 1 = 1`;
    let values = [];
    let parameterIndex = 1;

    // Check if groupProduct exists and is not 'All'
    if (groupProduct && groupProduct !== 'All') {
        query += ` AND group_product = $${parameterIndex}::VARCHAR`;
        values.push(groupProduct);
        parameterIndex++;
    }

    // Check if series exists and is not 'All'
    if (series && series !== 'All') {
        query += ` AND series = $${parameterIndex}::VARCHAR`;
        values.push(series);
        parameterIndex++;
    }

    // Check if search exists
    if (search) {
        query += ` AND description ILIKE $${parameterIndex}::TEXT`;
        values.push(`%${search}%`);
    }

    query += ` LIMIT 5`;

    try {
        const result = await pool.query(query, values);
        return result.rows;
    } catch (error) {
        console.error('Error fetching exam types:', error);
        throw error;
    }
};

module.exports = { getProductTypes, getGroupProducts, getSeries, getExamTypes };
