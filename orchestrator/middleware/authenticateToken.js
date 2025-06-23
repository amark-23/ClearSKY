const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token required' });
    }

    // Προαιρετικά, decode χωρίς verify για debugging
    try {
        const decoded = jwt.decode(token, { complete: true });
    } catch (decodeError) {
        console.log('[⚠️ AUTH] Could not decode token:', decodeError.message);
    }

    jwt.verify(token, SECRET, (err, user) => {
        if (err) {
            console.log('[❌ AUTH] Invalid token:', err.message);
            return res.status(403).json({ message: 'Invalid token' });
        }

        //console.log('[✅ AUTH] Token OK. User:', user);
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
