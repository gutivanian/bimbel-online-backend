// utils/tokenGenerator.js

const pool = require('../config/db.config');

// Fungsi untuk menghasilkan angka 8 digit acak
const generateRandomToken = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString(); // memastikan 8 digit
};

// Fungsi untuk menghasilkan token unik
const generateUniqueToken = async () => {
    let token;
    let exists = true;

    while (exists) {
        token = generateRandomToken();
        const res = await pool.query('SELECT 1 FROM dimCodeAttendance WHERE token = $1 LIMIT 1', [token]);
        exists = res.rowCount > 0;
    }

    return token;
};

module.exports = {
    generateUniqueToken,
};
