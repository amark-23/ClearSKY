const express = require('express');
const axios = require('axios');
const router = express.Router();
const jwt = require('jsonwebtoken');  // Add this line

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

router.post('/notify-student-created', async (req, res) => {
    const { userID, AMnumber } = req.body;

    if (!userID || !AMnumber) {
        return res.status(400).json({ message: 'Missing userID or AMnumber' });
    }

    try {
        console.log(`[ORCH] Received new student: userID=${userID}, AM=${AMnumber}`);

        // Create a service token for internal communication
        const serviceToken = jwt.sign(
            { service: 'orchestrator', type: 'service-auth' },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        let grade_response;
        // Forward to view-grades service (add error handling)
        try {
            grade_response=await axios.post('http://view-grades:3009/api/receiveUserUpdates', {
                userID,
                AMnumber
            });
        } catch (err) {
            console.error('[ORCH] ❌ Failed to forward to view-grades:', err.message);
            return res.status(502).json({ message: 'Failed to forward to view-grades' });
        }

        console.log('[ORCH] ✅ Forwarded to view-grades:', grade_response.data);

        // Forward to request-mngmnt service with authentication
        let response;
        try {
            response = await axios.post(
                'http://request-mngmnt:3003/api/receiveUserUpdates',
                { userID, AMnumber },
                { headers: { 'Authorization': `Bearer ${serviceToken}` } }
            );
        } catch (err) {
            console.error('[ORCH] ❌ Failed to forward to request-mngmnt:', err.message);
            if (err.response) {
                console.error('Response status:', err.response.status);
                console.error('Response data:', err.response.data);
            }
            return res.status(502).json({ message: 'Failed to forward to request-mngmnt' });
        }

        console.log('[ORCH] ✅ Forwarded to request-mngmnt:', response.data);
        return res.status(200).json({ message: 'Student forwarded to request service' });
    } catch (err) {
        console.error('[ORCH] ❌ Unexpected error:', err.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
    }
);

module.exports = router;