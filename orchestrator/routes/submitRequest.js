const express = require('express');
const axios = require('axios');
const router = express.Router();

const authenticateToken = require('../middleware/authenticateToken'); // middleware για JWT

router.post('/submit-request', authenticateToken, async (req, res) => {
    try {
        console.log('[📦 FORWARDING] Forwarding request to Request-Mngmnt with user:', req.user);
        console.log('[📦 FORWARDING] Request body:', req.body);
        console.log('[📦 FORWARDING] Authorization header:', req.headers['authorization']);

        const response = await axios.post('http://request-mngmnt:3003/api/submit-request', req.body, {
            headers: {
                Authorization: req.headers['authorization'],
                'Content-Type': 'application/json'
            }
        });

        await axios.post('http://replies-mngmnt:3007/api/events', {
            type: 'RequestCreated',
            data: response.data  // ή req.body, αν το response δεν περιέχει πλήρη δεδομένα
        }, {
            headers: {
                Authorization: req.headers['authorization'],
                'Content-Type': 'application/json'
            }
        });

        console.log('[📦 RESPONSE] Status:', response.status);
        console.log('[📦 RESPONSE] Data:', response.data);

        res.status(response.status).json(response.data);
    } catch (err) {
        //console.error('[🚨 ORCHESTRATOR ERROR]', err);

        if (err.response) {
            console.error('[🚨 ORCHESTRATOR ERROR] Response status:', err.response.status);
            console.error('[🚨 ORCHESTRATOR ERROR] Response data:', err.response.data);
            res.status(err.response.status).json(err.response.data);
        } else if (err.request) {
            console.error('[🚨 ORCHESTRATOR ERROR] No response received:', err.request);
            res.status(500).json({ message: 'No response from request-mngmnt service' });
        } else {
            console.error('[🚨 ORCHESTRATOR ERROR] Request setup error:', err.message);
            res.status(500).json({ message: 'Error setting up request to request-mngmnt service' });
        }
    }
});

module.exports = router;