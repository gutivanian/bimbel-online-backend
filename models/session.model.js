// models/session.model.js

const pool = require('../config/db.config');
 
const getSessions = async (filters = {}) => {
    let query = `
        SELECT 
            fs.id,
            fs.eventid,
            fs.create_user_id,
            u.username AS creator_name,
            fs.start_time,
            fs.end_time,
            fs.create_date,
            fs.update_date
        FROM fSession fs
        LEFT JOIN Users u ON fs.create_user_id = u.id
        WHERE 1=1
    `;
    
    const values = [];
    let counter = 1;

    if (filters.eventid) {
        query += ` AND fs.eventid = $${counter}`;
        values.push(filters.eventid);
        counter++;
    }

    if (filters.create_user_id) {
        query += ` AND fs.create_user_id = $${counter}`;
        values.push(filters.create_user_id);
        counter++;
    }

    const result = await pool.query(query, values);
    return result.rows;
};

const getSessionById = async (id) => {
    const query = `
        SELECT 
            fs.id,
            fs.eventid,
            fs.create_user_id,
            u.username AS creator_name,
            fs.start_time,
            fs.end_time,
            fs.create_date,
            fs.update_date,
            e.assigned_to
        FROM fSession fs
        LEFT JOIN Users u ON fs.create_user_id = u.id
        LEFT JOIN events e on e.id = fs.eventid
        WHERE fs.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

const getSessionByEventId = async (id) => {
    const query = `
        SELECT 
            fs.id,
            fs.eventid,
            fs.create_user_id,
            u.username AS creator_name,
            fs.start_time,
            fs.end_time,
            fs.create_date,
            fs.update_date,
            e.assigned_to
        FROM fSession fs
        LEFT JOIN Users u ON fs.create_user_id = u.id
        LEFT JOIN events e on e.id = fs.eventid
        WHERE fs.eventid = $1
        ORDER BY fs.create_date DESC
        LIMIT 1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

const createSession = async (data) => {
    const query = `
        INSERT INTO fSession 
            (eventid, create_user_id, start_time, end_time, create_date, update_date)
        VALUES 
            ($1, $2, NOW(), $3, NOW(), NOW())
        RETURNING *;
    `;
    const values = [
        data.eventid,
        data.create_user_id,
        data.end_time || null,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const updateSession = async (id, data) => {
    const query = `
        UPDATE fSession 
        SET 
            eventid = $1,
            create_user_id = $2,
            start_time = $3,
            end_time = $4,
            update_date = NOW()
        WHERE id = $5
        RETURNING *;
    `;
    const values = [
        data.eventid,
        data.create_user_id,
        data.start_time || null,
        data.end_time || null,
        id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const finishSession = async (id) => {
    const query = `
        UPDATE fSession 
        SET 
            end_time = NOW(),
            update_date = NOW()
        WHERE id = $1
        RETURNING *;
    `;
    const values = [
        id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const deleteSession = async (id) => {
    const query = `DELETE FROM fSession WHERE id = $1 RETURNING *;`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};
 
module.exports = {
    getSessions,
    getSessionById,
    getSessionByEventId,
    createSession,
    updateSession,
    deleteSession,
    finishSession
};
 