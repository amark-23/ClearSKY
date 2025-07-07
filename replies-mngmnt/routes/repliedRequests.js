const express = require('express');
const { all } = require('../db/connection');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// GET /repliedRequests - Επιστρέφει όλα τα διακριτά ζευγάρια id-requestID από τον πίνακα replies
router.get('/repliedRequests', authenticateToken, async (req, res) => {
  try {
    const rows = await all(
      `SELECT DISTINCT replyID, requestID FROM replies`
    );
    const response = { replied: rows };
    console.log('[REPLIES-MS] repliedRequests JSON:', JSON.stringify(response, null, 2)); // Debug print
    return res.json(response);
  } catch (err) {
    console.error('[REPLIES-MS] ❌ Failed to fetch replied requests:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;