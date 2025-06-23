const express = require('express');
const { get, run } = require('../db/connection');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/reply', authenticateToken, async (req, res) => {
    if (req.user.role !== 'instructor') {
        return res.status(403).json({ message: 'Only instructors can send replies' });
    }

    const { requestID, text } = req.body;
    const instrID = req.user.id;

    if (!requestID || !text) {
        return res.status(400).json({ message: 'Missing requestID or text' });
    }

    try {
        // Εύρεση του request με βάση το ID και το instrID
        const request = await get(
            `SELECT * FROM requests WHERE requestID = ? AND instrID = ?`,
            [requestID, instrID]
        );

        if (!request) {
            return res.status(404).json({ message: 'Request not found or not authorized' });
        }

        const { gradeID, studentAM, subjectID } = request;

        await run(
            `INSERT INTO replies (requestID, gradeID, instrID, studentAM, subjectID, time, text)
             VALUES (?, ?, ?, ?, ?, datetime('now'), ?)`,
            [requestID, gradeID, instrID, studentAM, subjectID, text]
        );
        console.log(`[REPLY] ✅ Reply submitted for request ${requestID} by instructor ${instrID}`);
        res.status(201).json({ message: 'Reply created successfully' });
    } catch (err) {
        console.error('[REPLY] ❌ Error replying to request:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
