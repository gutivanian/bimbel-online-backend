// controllers/attendanceType.controller.js

const AttendanceType = require('../models/attendanceType.model');

// Mendapatkan semua tipe presensi
const getAllAttendanceTypes = async (req, res) => {
    try {
        const types = await AttendanceType.getAttendanceTypes();
        res.json(types);
    } catch (error) {
        console.error('Get All Attendance Types Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Mendapatkan tipe presensi berdasarkan ID
const getAttendanceTypeById = async (req, res) => {
    const { id } = req.params;
    try {
        const type = await AttendanceType.getAttendanceTypeById(id);
        if (!type) {
            return res.status(404).json({ message: 'Attendance Type not found' });
        }
        res.json(type);
    } catch (error) {
        console.error('Get Attendance Type By ID Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Membuat tipe presensi baru
const createAttendanceType = async (req, res) => {
    const { type, description } = req.body;
    const create_user_id = req.user.id;

    try {
        const newType = await AttendanceType.createAttendanceType({
            type,
            description,
            create_user_id
        });
        res.status(201).json(newType);
    } catch (error) {
        console.error('Create Attendance Type Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Mengupdate tipe presensi
const updateAttendanceType = async (req, res) => {
    const { id } = req.params;
    const { type, description } = req.body;
    const edit_user_id = req.user.id;

    try {
        const existingType = await AttendanceType.getAttendanceTypeById(id);
        if (!existingType) {
            return res.status(404).json({ message: 'Attendance Type not found' });
        }

        const updatedType = await AttendanceType.updateAttendanceType(id, {
            type,
            description,
            edit_user_id,
        });
        res.json(updatedType);
    } catch (error) {
        console.error('Update Attendance Type Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Menghapus tipe presensi
const deleteAttendanceType = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedType = await AttendanceType.deleteAttendanceType(id);
        if (!deletedType) {
            return res.status(404).json({ message: 'Attendance Type not found' });
        }
        res.status(204).send(); // No Content
    } catch (error) {
        console.error('Delete Attendance Type Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getAllAttendanceTypes,
    getAttendanceTypeById,
    createAttendanceType,
    updateAttendanceType,
    deleteAttendanceType,
};
