// models/attendanceType.model.js

const pool = require('../config/db.config');

const getAttendanceTypes = async () => {
    const query = `SELECT * FROM dimAttendanceType;`;
    const result = await pool.query(query);
    return result.rows;
};

const getAttendanceTypeById = async (id) => {
    const query = `SELECT * FROM dimAttendanceType WHERE id = $1;`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

const createAttendanceType = async (data) => {
    const query = `
        INSERT INTO dimAttendanceType 
            (type, description, create_user_id)
        VALUES 
            ($1, $2, $3)
        RETURNING *;
    `;
    const values = [
        data.type,
        data.description,
        data.create_user_id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const updateAttendanceType = async (id, data) => {
    const query = `
        UPDATE dimAttendanceType 
        SET 
            type = $1,
            description = $2,
            edit_user_id = $3,
            edit_time = NOW()
        WHERE id = $4
        RETURNING *;
    `;
    const values = [
        data.type,
        data.description,
        data.edit_user_id,
        id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const deleteAttendanceType = async (id) => {
    const query = `DELETE FROM dimAttendanceType WHERE id = $1 RETURNING *;`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

module.exports = {
    getAttendanceTypes,
    getAttendanceTypeById,
    createAttendanceType,
    updateAttendanceType,
    deleteAttendanceType,
};
