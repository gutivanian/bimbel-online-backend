// routes/attendanceType.routes.js

const express = require('express');
const router = express.Router();
const AttendanceTypeController = require('../controllers/attendanceType.controller');
const authenticateJWT = require('../middleware/authenticateToken');

// Endpoint untuk mendapatkan semua tipe presensi
router.get('/', authenticateJWT, AttendanceTypeController.getAllAttendanceTypes);

// Endpoint untuk mendapatkan tipe presensi berdasarkan ID
router.get('/:id', authenticateJWT, AttendanceTypeController.getAttendanceTypeById);

// Endpoint untuk membuat tipe presensi baru
router.post('/', authenticateJWT, AttendanceTypeController.createAttendanceType);

// Endpoint untuk mengupdate tipe presensi
router.put('/:id', authenticateJWT, AttendanceTypeController.updateAttendanceType);

// Endpoint untuk menghapus tipe presensi
router.delete('/:id', authenticateJWT, AttendanceTypeController.deleteAttendanceType);

module.exports = router;
