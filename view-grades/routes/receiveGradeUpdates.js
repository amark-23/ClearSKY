const express = require('express');
const { run } = require('../db/connection');
const router = express.Router();

router.post('/', async (req, res) => {
    const {
        gradeID,
        AMnumber, studentName, studentMail,
        period, instrID, subID, scale, grade,
        submissionDate,
        Q01 = null, Q02 = null, Q03 = null, Q04 = null, Q05 = null,
        Q06 = null, Q07 = null, Q08 = null, Q09 = null, Q10 = null
    } = req.body;

    // Δεν κάνουμε πλέον υποχρεωτικό έλεγχο πεδίων, αν θέλεις μπορείς να προσθέσεις validation

    try {

        // Κάνε insert τη νέα εγγραφή μαζί με τα Q01-Q10
        await run(
            `INSERT INTO grades (
                gradeID, AMnumber, studentName, studentMail, period, instrID, subID, scale, grade, submissionDate,
                Q01, Q02, Q03, Q04, Q05, Q06, Q07, Q08, Q09, Q10
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            `,
            [gradeID, AMnumber, studentName, studentMail, period, instrID, subID, scale, grade, submissionDate,
             Q01, Q02, Q03, Q04, Q05, Q06, Q07, Q08, Q09, Q10]
        );

        res.status(201).json({ message: 'Grade inserted', gradeID });
    } catch (err) {
        console.error('[GRADE UPDATE] ❌', err.message);
        res.status(500).json({ message: 'Database error' });
    }
});

module.exports = router;
