const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

const axios = require('axios');

// GET /repliedRequests - Proxy προς replies-mngmnt
router.get('/repliedRequests', authenticateToken, async (req, res) => {
  try {
    const repliesRes = await axios.get('http://replies-mngmnt:3007/api/repliedRequests', {
      headers: {
        Authorization: req.headers.authorization,
      },
    });
    return res.json(repliesRes.data);
  } catch (err) {
    console.error('[ORCH] ❌ Failed to fetch replied requests:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;