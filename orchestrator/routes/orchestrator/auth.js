const express = require('express');
const router = express.Router();
const axios = require('axios');

const USER_MNGMNT_URL = process.env.USER_MNGMNT_URL || 'http://user-mngmnt:3001';

router.post('/login', async (req, res) => {
    try {
        const response = await axios.post(`${USER_MNGMNT_URL}/auth/login`, req.body);
        return res.status(response.status).json(response.data);
    } catch (error) {
        console.error('[LOGIN] ❌ Error from user-mngmnt:', error.message);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Login failed';
        return res.status(status).json({ message });
    }
});

router.post('/register', async (req, res) => {
    try {
        const response = await axios.post(`${USER_MNGMNT_URL}/auth/register`, req.body);
        return res.status(response.status).json(response.data);
    } catch (error) {
        console.error('[REGISTER] ❌ Error from user-mngmnt:', error.message);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Registration failed';
        return res.status(status).json({ message });
    }
});

module.exports = router;
