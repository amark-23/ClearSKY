const express = require('express');
const receiveUserUpdate = require('../utils/receiveUserUpdate');
const receiveGradeUpdate = require('../utils/receiveGradeUpdate');

const router = express.Router();

router.post('/events', async (req, res) => {
    const { type, data } = req.body;

    try {
        switch (type) {
            case 'UserCreated':
                await receiveUserUpdate(data);
                break;
            case 'GradeAdded':
            case 'GradeUpdated':
                await receiveGradeUpdate(data);
                break;
            default:
                console.warn(`Unknown event type: ${type}`);
        }
        res.status(200).json({ status: 'OK' });
    } catch (err) {
        console.error(`Error processing event ${type}:`, err);
        res.status(500).json({ status: 'ERROR', error: err.message });
    }
});

module.exports = router;
