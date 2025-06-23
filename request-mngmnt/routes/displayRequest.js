const express = require('express');
const router = express.Router();
const { query } = require('../db/connection'); // SQLite helper
const authenticateToken = require('../middleware/authMiddleware');

router.get('/displayRequests', authenticateToken, async (req, res) => {
  const user = req.user;
  console.log("[RQST] Reached /displayRequests");

  try {
    if (user.role !== 'instructor') {
      return res.status(403).json({ message: 'Unauthorized role' });
    }

    // Join requests with grades to get studentName and grade for instructor's requests
    const requests = await query(
      `SELECT r.requestID as id, r.studentAM, r.text as reason, g.grade, g.studentName as student
       FROM requests r
       JOIN grades g ON r.gradeID = g.gradeID
       WHERE r.instrID = ?
       ORDER BY r.time DESC`,
      [user.id]
    );

    return res.json({ requests });
  } catch (err) {
    console.error('[DB] Error fetching requests:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
