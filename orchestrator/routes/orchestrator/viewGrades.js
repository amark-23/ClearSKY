const express = require('express');
const router = express.Router();
const axios = require('axios');

const VIEW_GRADES_URL = 'http://view-grades:3009/api/displayGrades';

router.get('/grades', async (req, res) => {
    const { AMnumber } = req.query;
    const authHeader = req.headers['authorization'];

    console.log('[ORCH] -> /grades called with AMnumber:', AMnumber);
    console.log('[ORCH] Forwarding to:', VIEW_GRADES_URL);
    console.log('[ORCH] Authorization header:', authHeader);

    try {
        const response = await axios.get(`${VIEW_GRADES_URL}`, {
            params: { AMnumber },
            headers: { Authorization: authHeader }
        });
        console.log('[ORCH] <- Response from view-grades:', response.data);
        return res.status(response.status).json(response.data);
    } catch (error) {
        console.error('[ORCH] Error from view-grades:', error.response?.data || error.message);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Could not fetch grades';
        return res.status(status).json({ message });
    }
});

module.exports = router;