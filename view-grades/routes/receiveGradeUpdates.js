const express = require('express');
const { run } = require('../db/connection');
const router = express.Router();

router.post('/', async (req, res) => {
    const {
        gradeID,
        AMnumber, studentName, studentMail,
        period, instrID, subID, scale, grade,
        submissionDate
    } = req.body;

    if (!gradeID || !AMnumber || !studentName || !studentMail || !period || !instrID || !subID || !scale || grade == null || !submissionDate) {
        return res.status(400).json({ message: 'Missing required grade fields' });
    }

    try {
        // Βρες όλες τις εγγραφές για τον ίδιο μαθητή/μάθημα/περίοδο/κλίμακα με χρονική σειρά
  const oldRecords = await run(
    `SELECT submissionDate FROM grades WHERE AMnumber = ? AND subID = ? AND period = ? AND scale = ? ORDER BY submissionDate ASC`,
    [AMnumber, subID, period, scale]
  );

  // Αν υπάρχουν παλιές
  if (oldRecords.length > 1) {
    // Κράτα την παλαιότερη (index 0) και σβήσε τις υπόλοιπες (όλες εκτός της πρώτης)
    const datesToDelete = oldRecords.slice(1).map(r => r.submissionDate);
    await run(
      `DELETE FROM grades WHERE AMnumber = ? AND subID = ? AND period = ? AND scale = ? AND submissionDate IN (${datesToDelete.map(() => '?').join(',')})`,
      [AMnumber, subID, period, scale, ...datesToDelete]
    );
  }

  // Κάνε insert τη νέα εγγραφή
  await run(
    `INSERT INTO grades (gradeID, AMnumber, studentName, studentMail, period, instrID, subID, scale, grade, submissionDate)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [gradeID, AMnumber, studentName, studentMail, period, instrID, subID, scale, grade, submissionDate]
  );
        res.status(201).json({ message: 'Grade inserted', gradeID });
    } catch (err) {
        console.error('[GRADE UPDATE] ❌', err.message);
        res.status(500).json({ message: 'Database error' });
    }
});

module.exports = router;
