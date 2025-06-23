const express = require('express');
const axios = require('axios');
const authenticateToken = require('../middleware/authenticateToken'); // το JWT middleware

const router = express.Router();

router.get('/displayRequests', authenticateToken, async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized: No user info' });
    }

    try {
        // Κάλεσε το requests management microservice
        const response = await axios.get('http://request-mngmnt:3003/api/displayRequests', {
            headers: {
                Authorization: req.headers.authorization // προώθησε το token
            },
            params: {
                userID: user.id,
                role: user.role
            }
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('[Orchestrator] Error fetching requests:', error.message);
        res.status(500).json({ message: 'Error fetching requests from requests management service' });
    }
});

module.exports = router;