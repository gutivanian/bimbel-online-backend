const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticateJWT = require('../middleware/authenticateToken'); // Pastikan pathnya benar

// Rute untuk memeriksa autentikasi
router.get('/check-auth', authenticateJWT, (req, res) => {
    console.log('Authenticated user:', req.user);
    res.send({ isAuthenticated: true, username: req.user.username });
});

// Rute untuk mendapatkan user_id berdasarkan username
router.get('/username/:username', authenticateJWT, userController.findByUsername);

// Rute login
router.post('/login', userController.login);

// Rute register
router.post('/register', userController.create);

// Rute logout
router.post('/logout', userController.logout);

// Rute refresh token
router.post('/refresh-token', userController.refreshToken);

module.exports = router;
