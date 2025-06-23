const express = require('express');
const axios = require('axios');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

router.get('/replies', authenticateToken, async (req, res) => {
  try {
    // Forward the request to replies-mngmnt service
    // Pass the authorization header and user info
    
    const token = req.headers.authorization;


    const response = await axios.get('http://replies-mngmnt:3007/api/repliesdisplay', {
      headers: {
        Authorization: token,
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error('[Orchestrator] ❌ Error fetching replies:', err.message);
    res.status(err.response?.status || 500).json({ message: err.message || 'Internal server error' });
  }
});

module.exports = router;
