// grades-upload/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || 'your_secret_key';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    // περιμένουμε "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Malformed authorization header' });
    }

    const token = parts[1];
    jwt.verify(token, SECRET, (err, user) => {
        if (err) {
            console.error('[Auth] Token verification failed:', err.message);
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        // user π.χ. { id, email, username, role, iat, exp }
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
