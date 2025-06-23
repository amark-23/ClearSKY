const express = require('express');
const { run } = require('../db/connection');

const router = express.Router();

router.post('/events', async (req, res) => {
    const { type, data } = req.body;

    if (type === 'RequestCreated') {
        const { requestID, gradeID, studentAM, instrID, subjectID, time, text } = data;

        try {
            await run(`
                INSERT OR REPLACE INTO requests (requestID, gradeID, studentAM, instrID, subjectID, time, text)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [requestID, gradeID, studentAM, instrID, subjectID, time, text]);

            console.log(`[REPLIES-MS] ✅ Stored Request #${requestID}`);
            return res.status(200).json({ status: 'OK' });
        } catch (err) {
            console.error('[REPLIES-MS] ❌ Failed to store request:', err.message);
            return res.status(500).json({ status: 'ERROR' });
        }
    }

    return res.status(400).json({ status: 'Ignored', message: 'Unsupported event type' });
});

module.exports = router;
