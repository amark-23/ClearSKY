const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { all } = require('../db/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// Middleware για έλεγχο JWT και ρόλου
async function authenticateStudent(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('[VIEW-GRADES] Auth header:', authHeader);

    if (!token) {
        console.log('[VIEW-GRADES] No token provided');
        return res.status(401).json({ message: 'Token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('[VIEW-GRADES] Decoded JWT:', decoded);

        if (decoded.role !== 'student') {
            console.log('[VIEW-GRADES] Forbidden: role is not student');
            return res.status(403).json({ message: 'Forbidden: Only students can see their grades' });
        }

        req.user = decoded; // Περιέχει AMnumber, role, κλπ
        next();
    } catch (err) {
        console.log('[VIEW-GRADES] Invalid or expired token:', err.message);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

router.get('/', authenticateStudent, async (req, res) => {
  const AMnumber = req.user.AMnumber;
  console.log('[VIEW-GRADES] GET / for AMnumber:', AMnumber);

  try {
    const rows = await all(`
      SELECT s.subjectName, g.*
      FROM grades g
      LEFT JOIN subjects s ON g.subID = s.subjectID
      WHERE g.AMnumber = ?
    `, [AMnumber]);

    // Αν κάποιο row δεν έχει subjectName, το αναζητάμε στη βάση (όπως είχες)
    for (const row of rows) {
      if (!row.subjectName) {
        const subject = await all(
          `SELECT subjectName FROM subjects WHERE subjectID = ?`,
          [row.subID]
        );
        row.subjectName = subject[0] ? subject[0].subjectName : '';
      }
    }

    const result = {};
    rows.forEach(row => {
      const key = `${row.subjectName} - ${row.period}`;
      result[key] = {
        grade: row.grade,
        gradeID: row.gradeID,
        subjectID: row.subID,
        Q: {
          Q01: row.Q01,
          Q02: row.Q02,
          Q03: row.Q03,
          Q04: row.Q04,
          Q05: row.Q05,
          Q06: row.Q06,
          Q07: row.Q07,
          Q08: row.Q08,
          Q09: row.Q09,
          Q10: row.Q10,
        }
      };
    });

    console.log('[VIEW-GRADES] Returning result:', result);
    return res.json(result);
  } catch (err) {
    console.error('[DISPLAY GRADES] ❌', err.message);
    return res.status(500).json({ message: 'Error fetching grades' });
  }
});


module.exports = router;
