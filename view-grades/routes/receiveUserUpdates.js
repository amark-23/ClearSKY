const express = require('express');
const { run } = require('../db/connection');
const router = express.Router();

router.post('/', async (req, res) => {
    const { userID, AMnumber } = req.body;

    if (!userID || !AMnumber) return res.status(400).json({ message: 'Missing fields' });

    try {
        await run(`INSERT OR IGNORE INTO students (id, AMnumber) VALUES (?, ?)`, [userID, AMnumber]);
        res.status(201).json({ message: 'Student inserted successfully' });
    } catch (err) {
        console.error('[USER UPDATE] ❌', err.message);
        res.status(500).json({ message: 'Database error' });
    }
});

module.exports = router;
