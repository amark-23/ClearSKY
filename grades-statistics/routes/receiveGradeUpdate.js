const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.post('/grades-update', async (req, res) => {
    const {
        gradeID,
        AMnumber,
        studentName,
        studentMail,
        period,
        instrID,
        subID,
        scale,
        grade,
        submissionDate
    } = req.body;

    if (
        !gradeID ||
        !AMnumber ||
        !studentName ||
        !studentMail ||
        !period ||
        !instrID ||
        !subID ||
        !scale ||
        grade == null ||
        !submissionDate
    ) {
        return res.status(400).json({ message: 'Missing required grade data fields' });
    }

    try {

        // Εισαγωγή νέου βαθμού με συγκεκριμένο gradeID
        const insertSql = `
            INSERT INTO grades (gradeID, AMnumber, studentName, studentMail, period, instrID, subID, scale, grade, submissionDate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.run(insertSql, [gradeID, AMnumber, studentName, studentMail, period, instrID, subID, scale, grade, submissionDate]);

        console.log(`[STATS-MS] ✅ Grade updated: gradeID=${gradeID}, AM=${AMnumber}, subID=${subID}, period=${period}`);
        return res.status(200).json({ message: 'Grade inserted in statistics service', gradeID });
    } catch (err) {
        console.error('[STATS-MS] ❌ Error inserting grade:', err.message);
        return res.status(500).json({ message: 'Database error' });
    }
});

module.exports = router;
