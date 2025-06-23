const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../db');  // SQLite query helper
const router = express.Router();

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const users = await query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const tokenPayload = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role || 'user',
        };

        // Αν είναι student, βάζουμε το AMnumber από τον πίνακα users
        if (user.role === 'student' && user.AMnumber) {
            tokenPayload.AMnumber = user.AMnumber;
        }

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        console.error('[LOGIN] ❌ Server error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
