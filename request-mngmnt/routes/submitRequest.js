const express = require('express');
const router = express.Router();
const { query, run } = require('../db/connection');  // SQLite helpers
const authenticateToken = require('../middleware/authMiddleware');

router.post('/submit-request', authenticateToken, async (req, res) => {
    console.log('--- [REQUEST-MNGMNT] New request to /submit-request ---');

    const { text, gradeID } = req.body;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized: No user info' });
    }

    if (user.role !== 'student') {
        return res.status(403).json({ message: 'Unauthorized - only students can submit requests' });
    }

    if (!text || !gradeID) {
        return res.status(400).json({ message: 'Missing required fields: text and gradeID' });
    }

    try {
        // === 1. Get AM of the student
        const studentRows = await query('SELECT AMnumber FROM students WHERE id = ?', [user.id]);
        if (studentRows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        const studentAM = studentRows[0].AMnumber;

        // === 2. Get grade info
        const gradeRows = await query('SELECT AMnumber, instrID, subID FROM grades WHERE gradeID = ?', [gradeID]);
        if (gradeRows.length === 0) {
            return res.status(404).json({ message: 'Grade not found' });
        }
        const grade = gradeRows[0];

        // === 3. Check if grade belongs to this student
        if (studentAM !== grade.AMnumber) {
            return res.status(403).json({ message: 'Unauthorized - grade does not belong to student' });
        }

        // === 4. Insert request into DB
        const insertSql = `
            INSERT INTO requests (gradeID, studentAM, instrID, subjectID, time, text)
            VALUES (?, ?, ?, ?, datetime('now'), ?)
        `;
        await run(insertSql, [gradeID, studentAM, grade.instrID, grade.subID, text]);

        // === 5. Retrieve the newly inserted request (assumes auto-increment id)
        const [newRequest] = await query(`
            SELECT * FROM requests
            WHERE rowid = last_insert_rowid()
        `);

        return res.status(201).json(newRequest);
    } catch (err) {
        console.error('[REQUEST-MNGMNT] DB error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
