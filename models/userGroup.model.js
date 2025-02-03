const pool = require('../config/db.config.js');

const getGroups = async (searchName = null) => {
  let baseQuery = `
    SELECT 
      dgu.id,
      dgu.name,
      dgu.role,
      dgu.status,
      dgu.id_list,
      array_agg(vdu.name) AS user_names
    FROM 
      dimgroupstudent dgu
    CROSS JOIN LATERAL UNNEST(dgu.id_list) AS user_id
    JOIN 
      v_dashboard_userdata vdu ON vdu.userid = user_id
  `;

  const groupBy = ' GROUP BY dgu.id, dgu.name';
  
  let queryParams = [];
  let whereClause = '';

  if (searchName) {
    whereClause = ' WHERE dgu.name ILIKE $1';
    queryParams.push(`%${searchName}%`);
  }

  const finalQuery = baseQuery + whereClause + groupBy;
  
  try {
    const result = await pool.query(finalQuery, queryParams);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getGroups
};