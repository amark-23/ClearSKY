const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/grade-statistics/distribution?subjectName=Math&period=2024A
router.get('/statistics', async (req, res) => {
    const { subjectName, period } = req.query;
    // Δημιουργία params μόνο αν υπάρχουν
        const params = {};
        if (subjectName) params.subjectName = subjectName;
        if (period) params.period = period;

        console.log("[ORCH] Promoting statistics request to grades-statistics with params: ", params);
    try {
        
        // Κάνουμε HTTP αίτημα στο MS grades-statistics
        const response = await axios.get('http://grades-statistics:3011/api/statistics/distribution', {
            params
        });

        res.json(response.data);
        console.log("Received data:", response.data);
    } catch (error) {
        console.error('[Orchestrator] Error calling grades-statistics MS:', error.message);

        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }

        res.status(500).json({ message: 'Internal server error contacting grades-statistics' });
    }
});

module.exports = router;
