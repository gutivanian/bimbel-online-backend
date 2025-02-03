// routes/attendance.routes.js

const express = require('express');
const router = express.Router(); 
const AttendanceController = require('../controllers/attendance.controller');
const authenticateJWT = require('../middleware/authenticateToken');

// Endpoint untuk menandai presensi (teacher dan st udent)
router.post('/mark', authenticateJWT, AttendanceController.markAttendance);

// Endpoint untuk mendapatkan semua presensi
router.get('/', authenticateJWT, AttendanceController.getAllAttendances);

// Endpoint untuk mendapatkan presensi berdasarkan ID
router.get('/:id', authenticateJWT, AttendanceController.getAttendanceById);

// Endpoint untuk mengupdate presensi
router.put('/:id', authenticateJWT, AttendanceController.updateAttendance);

// Endpoint untuk menghapus presensi
router.delete('/:id', authenticateJWT, AttendanceController.deleteAttendance);

module.exports = router;
