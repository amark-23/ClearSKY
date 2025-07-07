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
        submissionDate,
        Q01, Q02, Q03, Q04, Q05, Q06, Q07, Q08, Q09, Q10
    } = req.body;

    // Έλεγχος βασικών πεδίων
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
        const upsertSql = `
            INSERT INTO grades (
                gradeID, AMnumber, studentName, studentMail,
                period, instrID, subID, scale, grade, submissionDate,
                Q01, Q02, Q03, Q04, Q05, Q06, Q07, Q08, Q09, Q10
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(gradeID) DO UPDATE SET
                AMnumber=excluded.AMnumber,
                studentName=excluded.studentName,
                studentMail=excluded.studentMail,
                period=excluded.period,
                instrID=excluded.instrID,
                subID=excluded.subID,
                scale=excluded.scale,
                grade=excluded.grade,
                submissionDate=excluded.submissionDate,
                Q01=excluded.Q01, Q02=excluded.Q02, Q03=excluded.Q03, Q04=excluded.Q04, Q05=excluded.Q05,
                Q06=excluded.Q06, Q07=excluded.Q07, Q08=excluded.Q08, Q09=excluded.Q09, Q10=excluded.Q10
        `;

        const params = [
            gradeID, AMnumber, studentName, studentMail,
            period, instrID, subID, scale, grade, submissionDate,
            Q01 ?? null, Q02 ?? null, Q03 ?? null, Q04 ?? null, Q05 ?? null,
            Q06 ?? null, Q07 ?? null, Q08 ?? null, Q09 ?? null, Q10 ?? null
        ];

        await db.run(upsertSql, params);

        console.log(`[STATS-MS] ✅ Grade upserted: gradeID=${gradeID}, AM=${AMnumber}, subID=${subID}, period=${period}`);
        return res.status(200).json({ message: 'Grade upserted in statistics service', gradeID });

    } catch (err) {
        console.error('[STATS-MS] ❌ Error upserting grade:', err.message);
        return res.status(500).json({ message: 'Database error' });
    }
});

module.exports = router;
