// routes/session.routes.js

const express = require('express');
const router = express.Router(); 
const SessionController = require('../controllers/session.controller');
const authenticateJWT = require('../middleware/authenticateToken');

// Endpoint untuk mendapatkan semua sesi
router.get('/', authenticateJWT, SessionController.getAllSessions);

// Endpoint untuk mendapatkan sesi berdasarkan ID
router.get('/:id', authenticateJWT, SessionController.getSessionById);
router.get('/event/:id', authenticateJWT, SessionController.getSessionByEventId);

// Endpoint untuk membuat sesi baru  
router.post('/', authenticateJWT, SessionController.createSession);

// Endpoint untuk mengupdate sesi
router.put('/:id', authenticateJWT, SessionController.updateSession);
router.put('/event/:eventid', authenticateJWT, SessionController.finishSession);

// Endpoint untuk menghapus sesi
router.delete('/:id', authenticateJWT, SessionController.deleteSession);

module.exports = router;
