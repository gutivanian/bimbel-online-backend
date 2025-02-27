// routes/codeAttendance.routes.js

const express = require('express');
const router = express.Router();
const CodeAttendanceController = require('../controllers/codeAttendance.controller');
const authenticateJWT = require('../middleware/authenticateToken');

// Endpoint untuk mendapatkan semua code attendances
router.get('/', authenticateJWT, CodeAttendanceController.getAllCodeAttendances);

// Endpoint untuk mendapatkan code attendance berdasarkan ID
router.get('/:id', authenticateJWT, CodeAttendanceController.getCodeAttendanceById);

// Endpoint untuk membuat code attendance baru (Generate QR Code)
router.post('/generate/:session_id', authenticateJWT, CodeAttendanceController.createCodeAttendance);
router.post('/check-and-generate/:session_id', authenticateJWT, CodeAttendanceController.checkAndGenerateCodeAttendance);
router.post('/check-and-generate-from-event/:event_id', authenticateJWT, CodeAttendanceController.checkAndGenerateFromEventCodeAttendance); 


// Endpoint untuk validasi QR Code

router.post('/validate-qrcode',authenticateJWT, CodeAttendanceController.validateQRCode);
 
// Endpoint untuk validasi token
router.post('/validate-token', authenticateJWT,CodeAttendanceController.validateToken);

// Endpoint untuk mengupdate status code attendance
router.put('/update-status', authenticateJWT, CodeAttendanceController.updateCodeAttendanceStatus);

module.exports = router;
