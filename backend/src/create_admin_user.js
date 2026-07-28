import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

// Create a connection pool
const pool = mysql.createPool({
    host: "210.1.86.211" || 'localhost',  // Use environment variable for security
    user: process.env.DB_USER || 'python',
    password: process.env.DB_PASS || 'sbtph@2018',
    database: process.env.DB_NAME || 'sbtph_leaderboard',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000
});

const registerUser = async () => {
    try {
        const login_id = 2992;
        const username = "rog";
        const password = "robudex17";
        const role = "admin";
        const status = "active";

        // Check if user already exists
        const [userExists] = await pool.execute('SELECT * FROM standard_users_login WHERE login_id = ?', [login_id]);

        if (userExists.length > 0) {
            console.log('User already exists');
            return;
        }

        // Hash password correctly
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into DB
        const [insertResult] = await pool.execute(
            `INSERT INTO standard_users_login (login_id, username, password_hash, status, role) 
             VALUES (?, ?, ?, ?, ?)`, 
            [login_id, username, hashedPassword, status, role]
        );

        if (insertResult.affectedRows === 1) {
            console.log('User registered successfully');
            process.exit(0)
        }
    } catch (error) {
        console.log('There is an error in user registration:', error);
        process.exit(0)
    }
};

// Run the function
registerUser();
