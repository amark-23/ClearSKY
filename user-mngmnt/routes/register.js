const express = require('express');
const bcrypt = require('bcrypt');
const { run, query } = require('../db');
const router = express.Router();
const axios = require('axios');

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'http://localhost:3000';

router.post('/', async (req, res) => {
    console.log('Register endpoint called');
    const { username, email, role, password, AMnumber } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).json({ message: 'Username, email, role, and password are required' });
    }

    if (role === "student" && !AMnumber) {
        return res.status(400).json({ message: 'AMnumber is required for student role' });
    }

    if (!['student', 'instructor'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    try {
        const existingUsers = await query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let insertSQL, insertParams;

        if (role === 'student') {
            insertSQL = 'INSERT INTO users (username, role, email, password, AMnumber) VALUES (?, ?, ?, ?, ?)';
            insertParams = [username, role, email, hashedPassword, AMnumber];
        } else {
            insertSQL = 'INSERT INTO users (username, role, email, password) VALUES (?, ?, ?, ?)';
            insertParams = [username, role, email, hashedPassword];
        }

        const result = await run(insertSQL, insertParams);
        const userId = result.lastID;

        if (role === 'student') {
            try {
                console.log('[FORWARD] Sending student data to orchestrator...');
                await axios.post(`${ORCHESTRATOR_URL}/api/notify-student-created`, {
                    userID: userId,
                    AMnumber: AMnumber,
                });
                console.log('[FORWARD] ✅ Notified orchestrator');
            } catch (err) {
                console.error('[FORWARD] ❌ Failed to notify orchestrator:', err.message);
            }

            return res.status(201).json({ message: 'Student registered successfully' });
        } else {
            return res.status(201).json({ message: 'Instructor registered successfully' });
        }

    } catch (error) {
        console.error('[REGISTER] ❌ Unexpected error:', error);
        return res.status(500).json({ message: 'Unexpected server error' });
    }
});

module.exports = router;
