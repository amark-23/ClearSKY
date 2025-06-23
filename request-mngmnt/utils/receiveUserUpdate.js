const express = require('express');
const router = express.Router();
const { run } = require('../db/connection');

router.post('/receiveUserUpdates', async (req, res) => {
    const { userID, AMnumber } = req.body;

    if (!userID || !AMnumber) {
        return res.status(400).json({ message: 'Missing userID or AMnumber' });
    }

    try {
        // Insert the student into the database
        const result = await run(
            'INSERT INTO students (id, AMnumber) VALUES (?, ?)', 
            [userID, AMnumber]
        );
        
        console.log(`[REQ-MS] ✅ Student inserted: userID=${userID}, AM=${AMnumber}`);
        return res.status(201).json({ message: 'Student created in request management service' });
    } catch (err) {
        console.error('[REQ-MS] ❌ Failed to insert student:', err.message);
        return res.status(500).json({ message: 'Database error' });
    }
});

module.exports = router;