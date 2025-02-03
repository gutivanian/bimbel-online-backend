// models/codeAttendance.model.js

const pool = require('../config/db.config');

const getCodeAttendances = async (filters = {}) => {
    let query = `
        SELECT 
            dca.id,
            dca.session_id,
            dca.event_id,
            dca.create_user_id,
            u.username AS creator_name,
            dca.qr_data,
            dca.token,
            dca.expiration_time,
            dca.status,
            dca.create_date
        FROM dimCodeAttendance dca
        LEFT JOIN Users u ON dca.create_user_id = u.id
        WHERE 1=1
    `;
    
    const values = [];
    let counter = 1;

    if (filters.session_id) {
        query += ` AND dca.session_id = $${counter}`;
        values.push(filters.session_id);
        counter++;
    }

    if (filters.status) {
        query += ` AND dca.status = $${counter}`;
        values.push(filters.status);
        counter++;
    }

    const result = await pool.query(query, values);
    return result.rows;
};

const getCodeAttendanceById = async (id) => {
    const query = `
        SELECT 
            dca.id,
            dca.session_id,
            dca.event_id,
            dca.create_user_id,
            u.username AS creator_name,
            dca.qr_data,
            dca.token,
            dca.expiration_time,
            dca.status,
            dca.create_date
        FROM dimCodeAttendance dca
        LEFT JOIN Users u ON dca.create_user_id = u.id
        WHERE dca.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

const getValidCodeAttendances = async (session_id) => {
    const query = `
        SELECT 
            dca.id,
            dca.session_id,
            dca.event_id,
            dca.create_user_id,
            u.username AS creator_name,
            dca.qr_data,
            dca.token,
            dca.expiration_time,
            dca.status,
            dca.create_date,
            dca.qr_image
        FROM dimCodeAttendance dca
        LEFT JOIN Users u ON dca.create_user_id = u.id
        WHERE dca.session_id = $1 
            AND dca.expiration_time >= NOW() AT TIME ZONE 'Asia/Jakarta'  -- Pastikan waktu kedaluwarsa lebih besar atau sama dengan waktu sekarang dalam zona waktu Jakarta
            AND dca.qr_image IS NOT NULL      -- Pastikan ada gambar QR Code
        ORDER BY dca.expiration_time DESC   -- Urutkan berdasarkan waktu kedaluwarsa terbaru
        LIMIT 1;                            -- Ambil satu hasil yang paling valid (terbaru)
    `;
    
    const result = await pool.query(query, [session_id]);
    const code = result.rows[0];
    console.log(code);

    if (code && code.qr_image) {
        // Konversi Buffer menjadi Base64 string
        code.qr_image = `data:image/png;base64,${code.qr_image.toString('base64')}`;
    }

    return code;  // Mengembalikan hasil dengan qr_image dalam format Base64
};



// models/codeAttendance.model.js
const getCodeAttendanceByToken = async (token) => {
    const query = `
      SELECT * FROM dimCodeAttendance 
      WHERE token = $1 AND expiration_time >= NOW();
    `;
    const result = await pool.query(query, [token]);
    return result.rows[0];
  };
 
const createCodeAttendance = async (data) => {
    const query = `
        INSERT INTO dimCodeAttendance 
            (session_id, event_id, create_user_id, qr_data, token, expiration_time, status, create_date, qr_image)
        VALUES 
            ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
        RETURNING *;
    `; 
    const values = [
        data.session_id,
        data.event_id,
        data.create_user_id,
        data.qr_data,
        data.token,
        data.expiration_time,
        data.status,
        data.qr_image
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const updateCodeAttendance = async (id, data) => {
    const query = `
        UPDATE dimCodeAttendance 
        SET 
            session_id = $1,
            event_id = $2,
            create_user_id = $3,
            qr_data = $4,
            token = $5,
            expiration_time = $6,
            status = $7,
            create_date = NOW()
        WHERE id = $8
        RETURNING *;
    `;
    const values = [
        data.session_id,
        data.event_id,
        data.create_user_id,
        data.qr_data,
        data.token,
        data.expiration_time,
        data.status,
        id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const updateCodeAttendanceStatus = async (token, status) => {
    const query = `
        UPDATE dimCodeAttendance 
        SET status = $1
        WHERE token = $2
        RETURNING *;
    `;
    const values = [status, token];
    const result = await pool.query(query, values);
    return result.rows[0];
};

module.exports = {
    getCodeAttendances,
    getCodeAttendanceById,
    getCodeAttendanceByToken,
    createCodeAttendance,
    updateCodeAttendance,
    updateCodeAttendanceStatus,
    getValidCodeAttendances
};
