const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET_KEY;

const authenticateJWT = (req, res, next) => {
    let token = req.cookies.authToken || req.headers['authorization'];
    console.log('Token:', token); // Log token untuk debugging

    if (token) {
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length); // Remove Bearer from string
        }

        jwt.verify(token, secretKey, (err, user) => {
            console.log('Verifying token...');
            if (err) {
                console.error('JWT Verification Error:', err); // Log error untuk debugging
                return res.sendStatus(403);
            }
            console.log('Token Verified, User:', user); // Log user setelah token diverifikasi
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

module.exports = authenticateJWT;
