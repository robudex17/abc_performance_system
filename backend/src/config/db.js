// src/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config()

console.log(process.env.DB_HOST)

// Create a connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'your_database_name',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000
});

module.exports = pool;

