const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

// Baca CA certificate
const ca = fs.readFileSync('./ca.pem').toString();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        ca: ca,
        rejectUnauthorized: true // Set true untuk keamanan yang lebih baik
    }
});

module.exports = pool;
