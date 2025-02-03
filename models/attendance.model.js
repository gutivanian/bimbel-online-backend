// models/attendance.model.js

const pool = require('../config/db.config');

const getAttendances = async (filters = {}) => {
    let query = `
        SELECT 
            fa.id,
            fa.userid,
            fa.reff_userid,
            fa.type_id,
            dt.type AS attendance_type,
            fa.notes,
            fa.timestamp,
            fa.latitude,
            fa.longitude,
            u1.username AS user_name,
            u2.username AS referenced_user_name
        FROM fAttendances fa
        LEFT JOIN dimAttendanceType dt ON fa.type_id = dt.id
        LEFT JOIN Users u1 ON fa.userid = u1.id
        LEFT JOIN Users u2 ON fa.reff_userid = u2.id
        WHERE 1=1
    `; 
    
    const values = [];
    let counter = 1;

    if (filters.userid) {
        query += ` AND fa.userid = $${counter}`;
        values.push(filters.userid);
        counter++;
    }

    if (filters.type_id) {
        query += ` AND fa.type_id = $${counter}`;
        values.push(filters.type_id);
        counter++;
    }

    if (filters.session_id) {
        query += ` AND fa.session_id = $${counter}`;
        values.push(filters.session_id);
        counter++;
    }

    const result = await pool.query(query, values);
    return result.rows;
};

const getAttendanceById = async (id) => {
    const query = `
        SELECT 
            fa.id,
            fa.userid,
            fa.reff_userid,
            fa.type_id,
            dt.type AS attendance_type,
            fa.notes,
            fa.timestamp,
            fa.latitude,
            fa.longitude,
            u1.username AS user_name,
            u2.username AS referenced_user_name
        FROM fAttendances fa
        LEFT JOIN dimAttendanceType dt ON fa.type_id = dt.id
        LEFT JOIN Users u1 ON fa.userid = u1.id
        LEFT JOIN Users u2 ON fa.reff_userid = u2.id
        WHERE fa.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

const createAttendance = async (data) => {
    const query = `
        INSERT INTO fAttendances 
            (userid, reff_userid, type_id, notes, timestamp, latitude, longitude, session_id)
        VALUES 
            ($1, $2, $3, $4, NOW(), $5, $6, $7)
        RETURNING *;
    `;
    const values = [
        data.userid,
        data.reff_userid || null,
        data.type_id,
        data.notes || null,
        data.latitude || null,
        data.longitude || null,
        data.session_id || null,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const updateAttendance = async (id, data) => {
    const query = `
        UPDATE fAttendances 
        SET 
            userid = $1,
            reff_userid = $2,
            type_id = $3,
            notes = $4,
            timestamp = NOW(),
            latitude = $5,
            longitude = $6,
            session_id = $7
        WHERE id = $8
        RETURNING *;
    `;
    const values = [
        data.userid,
        data.reff_userid || null,
        data.type_id,
        data.notes || null,
        data.latitude || null,
        data.longitude || null,
        data.session_id || null,
        id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const deleteAttendance = async (id) => {
    const query = `DELETE FROM fAttendances WHERE id = $1 RETURNING *;`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

module.exports = {
    getAttendances,
    getAttendanceById,
    createAttendance,
    updateAttendance,
    deleteAttendance,
};
