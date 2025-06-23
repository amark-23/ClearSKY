const express = require('express');
const { all } = require('../db/connection');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// GET /repliesdisplay για student ή instructor
router.get('/repliesdisplay', authenticateToken, async (req, res) => {
    const role = req.user.role;
    const userId = req.user.id;
    const studentAM = req.user.AMnumber;

    console.log('[REPLIES-MS] 🔍 Incoming request');
    console.log(`[REPLIES-MS] User Role: ${role}`);
    console.log(`[REPLIES-MS] User ID: ${userId}`);
    if (studentAM) console.log(`[REPLIES-MS] Student AM: ${studentAM}`);

    try {
        let query = `SELECT * FROM replies WHERE `;
        const params = [];

        if (role === 'student') {
            if (!studentAM) {
                console.warn('[REPLIES-MS] ⚠️ Missing student AM in token');
                return res.status(400).json({ message: 'Student AM is missing from token' });
            }

            query += `studentAM = ?`;
            params.push(studentAM);
        } else if (role === 'instructor') {
            query += `instrID = ?`;
            params.push(userId);
        } else {
            console.warn('[REPLIES-MS] ❌ Unauthorized role:', role);
            return res.status(403).json({ message: 'Unauthorized role' });
        }

        console.log('[REPLIES-MS] 🧠 Executing query:', query);
        console.log('[REPLIES-MS] 📦 With params:', params);

        const rows = await all(query, params);

        console.log(`[REPLIES-MS] ✅ Found ${rows.length} replies`);
        return res.json({ replies: rows });

    } catch (err) {
        console.error('[REPLIES-MS] ❌ Failed to fetch replies:', err.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
