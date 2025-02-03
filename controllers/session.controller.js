// controllers/session.controller.js
const Session = require('../models/session.model');
const Attendance = require('../models/attendance.model');
const eventModel = require('../models/event.model');
const CodeAttendance = require('../models/codeAttendance.model');
const { generateUniqueToken } = require('../utils/attendanceTokenGenerator'); // Import fungsi token generator
const QRCode = require('qrcode');

// Mendapatkan semua sesi
const getAllSessions = async (req, res) => {
    try {
        const { eventid, create_user_id } = req.query;
        const sessions = await Session.getSessions({ eventid, create_user_id });
        res.json(sessions);
    } catch (error) {
        console.error('Get All Sessions Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Mendapatkan sesi berdasarkan ID
const getSessionById = async (req, res) => {
    const { id } = req.params;
    try {
        const session = await Session.getSessionById(id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }
        res.json(session);
    } catch (error) {
        console.error('Get Session By ID Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getSessionByEventId = async (req, res) => {
    const { id } = req.params;
    try {
        const session = await Session.getSessionByEventId(id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }
        res.json(session);
    } catch (error) {
        console.error('Get Session By ID Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
 
// Membuat sesi baru
const createSession = async (req, res) => {
    const { eventid , latitude, longitude, notes} = req.body;
    const create_user_id = req.user.id;
    // Tambahkan log untuk memeriksa nilai create_user_id
    console.log('Creating session for user ID:', create_user_id);

    try {
        const newSession = await Session.createSession({
            eventid,
            create_user_id,
            end_time: null,
        });
        const session_id = newSession.id
        const updatedEvent = await eventModel.startEvent(eventid)
        try {
                const attendanceData = {
                    userid: create_user_id,
                    reff_userid: null,
                    type_id: 1,
                    notes,
                    latitude,
                    longitude,
                    session_id,
                };
        
                const result = await Attendance.createAttendance(attendanceData);
        
                const token = await generateUniqueToken();
                const qr_data = JSON.stringify({ session_id, reff_userid:create_user_id,type_id:1, token });
                const expiration_time = new Date(Date.now() + 15 * 60 * 1000); // 15 menit
                const qrImageBuffer = await QRCode.toBuffer(qr_data); // Menghasilkan buffer QR Code dalam format bytea
 
                        // Insert code attendance
                const codeData = {
                    session_id,
                    event_id: eventid,
                    create_user_id,
                    qr_data,
                    token,
                    expiration_time,
                    status: 'active',
                    qr_image: qrImageBuffer
                };

                const newCode = await CodeAttendance.createCodeAttendance(codeData);
        
                // Generate QR Code image sebagai data URL
                const qrImage = await QRCode.toDataURL(qr_data);
        
                res.status(201).json({ qrImage, token, expiration_time });

            } catch (error) {
                console.error('Error marking attendance:', error);
                return res.status(500).json({
                    success: false,
                    message: 'An error occurred while marking attendance.',
                    error: error.message,
                });
            }
    } catch (error) {
        console.error('Create Session Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
 
// Mengupdate sesi
const updateSession = async (req, res) => {
    const { id } = req.params;
    const { eventid, start_time, end_time } = req.body;
    const create_user_id = req.user.id;
 
    try {
        const existingSession = await Session.getSessionById(id);
        if (!existingSession) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // // Validasi apakah user yang mengupdate adalah pembuat sesi
        // if (existingSession.create_user_id !== create_user_id) {
        //     return res.status(403).json({ message: 'Not authorized to update this session' });
        // }

        const updatedSession = await Session.updateSession(id, {
            eventid,
            create_user_id,
            start_time, 
            end_time,
        });
        res.json(updatedSession);
    } catch (error) {
        console.error('Update Session Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
 
const finishSession = async (req, res) => {
    const { eventid } = req.params;
    const {notes, longitude, latitude} = req.body;
    const create_user_id = req.user.id;
 
    try {
        const existingSession = await Session.getSessionByEventId(eventid);
        if (!existingSession) {
            return res.status(404).json({ message: 'Session not found' });
        }
        const session_id = existingSession.id;
        console.log(existingSession)
        // // Validasi apakah user yang mengupdate adalah pembuat sesi
        // if (existingSession.create_user_id !== create_user_id) {
        //     return res.status(403).json({ message: 'Not authorized to update this session' });
        // }

        const updatedSession = await Session.finishSession(session_id);

        const attendanceData = {
            userid: create_user_id,
            reff_userid: null,
            type_id: 2,
            notes,
            latitude,
            longitude, 
            session_id:session_id,
        };

        const result = await Attendance.createAttendance(attendanceData);

        const token = await generateUniqueToken();
        const qr_data = JSON.stringify({ session_id, reff_userid:create_user_id,type_id:2, token });
        const expiration_time = new Date(Date.now() + 60 * 60 * 1000); // 15 menit
        const qrImageBuffer = await QRCode.toBuffer(qr_data); // Menghasilkan buffer QR Code dalam format bytea

                // Insert code attendance
        const codeData = {
            session_id,
            event_id: eventid,
            create_user_id,
            qr_data,
            token,
            expiration_time,
            status: 'active',
            qr_image: qrImageBuffer
        };

        const newCode = await CodeAttendance.createCodeAttendance(codeData);

        // Generate QR Code image sebagai data URL
        const qrImage = await QRCode.toDataURL(qr_data);

        res.status(201).json({ qrImage, token, expiration_time });

    } catch (error) {
        console.error('Update Session Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Menghapus sesi
const deleteSession = async (req, res) => {
    const { id } = req.params;
    const create_user_id = req.user.id;

    try {
        const existingSession = await Session.getSessionById(id);
        if (!existingSession) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Validasi apakah user yang menghapus adalah pembuat sesi
        if (existingSession.create_user_id !== create_user_id) {
            return res.status(403).json({ message: 'Not authorized to delete this session' });
        }

        await Session.deleteSession(id);
        res.status(204).send(); // No Content
    } catch (error) {
        console.error('Delete Session Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getAllSessions,
    getSessionById,
    createSession,
    updateSession,
    finishSession,
    deleteSession,
    getSessionByEventId
};
