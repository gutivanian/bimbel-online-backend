const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

// Read CA certificate
const ca = fs.readFileSync('./ca.pem').toString();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    // ssl: {
    //     ca: ca,
    //     rejectUnauthorized: true // Set to true for better security
    // }
});

// Test the database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error acquiring client', err.stack);
    } else {
        console.log('Connected to the database');
    }
    release();
});

module.exports = pool;
