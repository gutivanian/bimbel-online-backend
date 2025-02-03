// controllers/attendance.controller.js

const Attendance = require('../models/attendance.model');
const AttendanceType = require('../models/attendanceType.model');
const CodeAttendance = require('../models/codeAttendance.model');
const Session = require('../models/session.model');

// Fungsi untuk menandai presensi (teacher dan student)
const markAttendance = async (req, res) => {
    try {
        const { reff_userid, type_id, notes, latitude, longitude, session_id } = req.body;

        // Ambil userid dari JWT hasil middleware
        const userid = req.user.id;

        const attendanceData = {
            userid,
            reff_userid,
            type_id,
            notes,
            latitude,
            longitude,
            session_id,
        };

        const result = await Attendance.createAttendance(attendanceData);

        return res.status(201).json({
            success: true,
            message: 'Attendance marked successfully.',
            data: result,
        });
    } catch (error) {
        console.error('Error marking attendance:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while marking attendance.',
            error: error.message,
        });
    }
};

// Mendapatkan semua presensi
const getAllAttendances = async (req, res) => {
    try {
        const { userid, type_id, session_id } = req.query;
        const attendances = await Attendance.getAttendances({ userid, type_id, session_id });
        res.json(attendances);
    } catch (error) {
        console.error('Get All Attendances Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Mendapatkan presensi berdasarkan ID
const getAttendanceById = async (req, res) => {
    const { id } = req.params;
    try {
        const attendance = await Attendance.getAttendanceById(id);
        if (!attendance) {
            return res.status(404).json({ message: 'Attendance not found' });
        }
        res.json(attendance);
    } catch (error) {
        console.error('Get Attendance By ID Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Mengupdate presensi
const updateAttendance = async (req, res) => {
    const { id } = req.params;
    const { userid, reff_userid, type_id, notes, latitude, longitude } = req.body;

    try {
        const existingAttendance = await Attendance.getAttendanceById(id);
        if (!existingAttendance) {
            return res.status(404).json({ message: 'Attendance not found' });
        }

        // Validasi hak akses (misalnya, hanya admin atau user yang bersangkutan yang bisa mengupdate)
        // Implementasikan sesuai kebutuhan

        const updatedAttendance = await Attendance.updateAttendance(id, {
            userid,
            reff_userid,
            type_id,
            notes,
            latitude,
            longitude,
        });
        res.json(updatedAttendance);
    } catch (error) {
        console.error('Update Attendance Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Menghapus presensi
const deleteAttendance = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedAttendance = await Attendance.deleteAttendance(id);
        if (!deletedAttendance) {
            return res.status(404).json({ message: 'Attendance not found' });
        }
        res.status(204).send(); // No Content
    } catch (error) {
        console.error('Delete Attendance Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    markAttendance,
    getAllAttendances,
    getAttendanceById,
    updateAttendance,
    deleteAttendance,
};
