// src/models/userModel.js
const pool = require('../config/db');

// Fetch all users
const getAllUsers = async () => {
    try {
        const [rows] = await pool.query('SELECT * FROM users');
        return rows;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Fetch a single user by ID
const getUserById = async (id) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    } catch (error) {
        throw new Error(error.message);
    }
};

// Create a new user
const createUser = async (userData) => {
    const { name, email, password } = userData;
    try {
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, password]
        );
        return result.insertId;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Update a user by ID
const updateUser = async (id, userData) => {
    const { name, email, password } = userData;
    try {
        const [result] = await pool.query(
            'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?',
            [name, email, password, id]
        );
        return result.affectedRows > 0;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Delete a user by ID
const deleteUser = async (id) => {
    try {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows > 0;
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};
