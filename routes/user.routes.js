const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticateJWT = require('../middleware/authenticateToken'); // Pastikan pathnya benar
const authenticateRole = require('../middleware/authenticateRole'); // Import authenticateRole

// Rute untuk memeriksa autentikasi 
router.get('/check-auth', authenticateJWT, (req, res) => {
    console.log('Authenticated user:', req.user);
    res.send({ isAuthenticated: true, username: req.user.username });
});

// Rute untuk mendapatkan user_id berdasarkan username
router.get('/username/:username', authenticateJWT, authenticateRole(['admin', 'user']), userController.findByUsername);

// Rute login   
router.post('/login', userController.login);

// Rute register
router.post('/register', userController.create);

// Rute logout
router.post('/logout', userController.logout);

// Rute refresh token
router.post('/refresh-token', userController.refreshToken);

// Contoh rute yang hanya bisa diakses oleh admin
router.get('/admin/dashboard', authenticateJWT, authenticateRole(['admin']), (req, res) => {
    res.send('Welcome to the admin dashboard!');
});


module.exports = router;
