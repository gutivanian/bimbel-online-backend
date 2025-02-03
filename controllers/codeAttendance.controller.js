// controllers/codeAttendance.controller.js
const CodeAttendance = require('../models/codeAttendance.model');
const { generateUniqueToken } = require('../utils/attendanceTokenGenerator'); // Import fungsi token generator
const QRCode = require('qrcode');
const Session = require('../models/session.model');
const { v4: uuidv4 } = require('uuid');


// Mendapatkan semua code attendances
const getAllCodeAttendances = async (req, res) => {
    try {
        const { session_id, status } = req.query;
        const codes = await CodeAttendance.getCodeAttendances({ session_id, status });
        res.json(codes);
    } catch (error) {
        console.error('Get All Code Attendances Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Mendapatkan code attendance berdasarkan ID
const getCodeAttendanceById = async (req, res) => {
    const { id } = req.params;
    try {
        const code = await CodeAttendance.getCodeAttendanceById(id);
        if (!code) {
            return res.status(404).json({ message: 'Code Attendance not found' });
        }
        res.json(code);
    } catch (error) {
        console.error('Get Code Attendance By ID Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
 
// Membuat code attendance baru (Generate QR Code)
const createCodeAttendance = async (req, res) => {
    const { session_id } = req.params;
    const create_user_id = req.user.id;

    try {
        // Validasi sesi
        const session = await Session.getSessionById(session_id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Validasi apakah user adalah pembuat sesi
        if (session.create_user_id !== create_user_id) {
            return res.status(403).json({ message: 'Not authorized to generate QR Code for this session' });
        }

        // Generate token unik 8 digit
        const token = await generateUniqueToken();

        // Buat qr_data (misalnya JSON string)
        const qr_data = JSON.stringify({ session_id, token, reff_user_id:create_user_id,type_id:1 });

        // Tentukan expiration_time (misalnya 15 menit dari sekarang)
        const expiration_time = new Date(Date.now() + 15 * 60 * 1000); // 15 menit
        const qrImageBuffer = await QRCode.toBuffer(qr_data); // Menghasilkan buffer QR Code dalam format bytea

        // Insert code attendance
        const codeData = {
            session_id,
            event_id: session.eventid,
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
        console.error('Create Code Attendance Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Mengupdate status code attendance (misalnya 'used' setelah digunakan)
const updateCodeAttendanceStatus = async (req, res) => {
    const { token } = req.body;
    const { status } = req.body; // 'active', 'expired', 'used'

    try {
        const updatedCode = await CodeAttendance.updateCodeAttendanceStatus(token, status);
        if (!updatedCode) {
            return res.status(404).json({ message: 'Code Attendance not found' });
        }
        res.json(updatedCode);
    } catch (error) {
        console.error('Update Code Attendance Status Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Fungsi untuk mengecek apakah ada code attendance yang valid
const checkAndGenerateFromEventCodeAttendance = async (req, res) => {
    const { event_id } = req.params;
    const create_user_id = req.user.id;
    try {
        const eventsession = await Session.getSessionByEventId(event_id);
        if (!eventsession) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const session_id = eventsession.id
        // Cek apakah sudah ada code attendance yang valid
        const latestValidCode = await CodeAttendance.getValidCodeAttendances(session_id);

        if (latestValidCode) {
            // Jika ada code attendance yang masih valid, kirimkan data yang sudah ada
            return res.status(200).json({
                qrImage: latestValidCode.qr_image, // Kirimkan gambar QR Code yang sudah ada
                token: latestValidCode.token,
                expiration_time: latestValidCode.expiration_time,
            });
        }

        // Jika tidak ada code attendance yang valid, buat yang baru
        // Validasi sesi
        const session = await Session.getSessionById(session_id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Validasi apakah user adalah pembuat sesi
        if (session.create_user_id !== create_user_id) {
            return res.status(403).json({ message: 'Not authorized to generate QR Code for this session' });
        }

        // Generate token unik 8 digit
        const token = await generateUniqueToken();

        // Buat qr_data (misalnya JSON string)
        const qr_data = JSON.stringify({ session_id, token,reff_user_id:create_user_id,type_id:1 });

        // Tentukan expiration_time (misalnya 15 menit dari sekarang)
        const expiration_time = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

        // Generate QR Code image sebagai buffer (bytea)
        const qrImageBuffer = await QRCode.toBuffer(qr_data); // Menghasilkan buffer QR Code dalam format bytea

        // Insert code attendance
        const codeData = {
            session_id,
            event_id: session.eventid,
            create_user_id,
            qr_data,
            token,
            expiration_time,
            status: 'active',
            qr_image: qrImageBuffer, // Simpan gambar QR Code dalam bentuk buffer
        };

        const newCode = await CodeAttendance.createCodeAttendance(codeData);

        res.status(201).json({
            qrImage: `data:image/png;base64,${newCode.qr_image.toString('base64')}`,
            token: newCode.token,
            expiration_time: newCode.expiration_time,
        });
    } catch (error) {
        console.error('Check and Generate Code Attendance Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const checkAndGenerateCodeAttendance = async (req, res) => {
    const { id } = req.params;
    const create_user_id = req.user.id;
    try {
        // Cek apakah sudah ada code attendance yang valid
        const latestValidCode = await CodeAttendance.getValidCodeAttendances(session_id);

        if (latestValidCode) {
            // Jika ada code attendance yang masih valid, kirimkan data yang sudah ada
            return res.status(200).json({
                qrImage: latestValidCode.qr_image, // Kirimkan gambar QR Code yang sudah ada
                token: latestValidCode.token,
                expiration_time: latestValidCode.expiration_time,
            });
        }

        // Jika tidak ada code attendance yang valid, buat yang baru
        // Validasi sesi
        const session = await Session.getSessionById(id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Validasi apakah user adalah pembuat sesi
        if (session.create_user_id !== create_user_id) {
            return res.status(403).json({ message: 'Not authorized to generate QR Code for this session' });
        }

        // Generate token unik 8 digit
        const token = await generateUniqueToken();

        // Buat qr_data (misalnya JSON string)
        const qr_data = JSON.stringify({ session_id: id, token ,reff_user_id:create_user_id,type_id:1});

        // Tentukan expiration_time (misalnya 15 menit dari sekarang)
        const expiration_time = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

        // Generate QR Code image sebagai buffer (bytea)
        const qrImageBuffer = await QRCode.toBuffer(qr_data); // Menghasilkan buffer QR Code dalam format bytea

        // Insert code attendance
        const codeData = {
            session_id,
            event_id: session.eventid,
            create_user_id,
            qr_data,
            token,
            expiration_time,
            status: 'active',
            qr_image: qrImageBuffer, // Simpan gambar QR Code dalam bentuk buffer
        };

        const newCode = await CodeAttendance.createCodeAttendance(codeData);

        res.status(201).json({
            qrImage: `data:image/png;base64,${newCode.qr_image.toString('base64')}`,
            token: newCode.token,
            expiration_time: newCode.expiration_time,
        });
    } catch (error) {
        console.error('Check and Generate Code Attendance Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const validateQRCode = async (req, res) => {
    const { qrCode } = req.body;
  
    try {
      const qrData = JSON.parse(qrCode); // Mengambil data JSON dari QR Code
      const { session_id, token } = qrData;
  
      // Cek apakah QR Code valid
      const codeAttendance = await CodeAttendance.getCodeAttendanceByToken(token);
  
      if (!codeAttendance || new Date(codeAttendance.expiration_time) < new Date()) {
        return res.status(400).json({ message: 'QR Code tidak valid atau sudah kadaluarsa.' });
      }
  
      // Simpan ke database (misalnya tabel presensi)
      // Simpan ke tabel presensi atau yang sesuai
      // Presensi sudah berhasil divalidasi dan disimpan
  
      return res.status(200).json({ message: 'QR Code valid! Presensi berhasil.' });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Terjadi kesalahan dalam memvalidasi QR Code.' });
    }
  };
  
  const validateToken = async (req, res) => {
    const { token } = req.body;
  
    try {
      // Cek apakah token valid
      const codeAttendance = await CodeAttendance.getCodeAttendanceByToken(token);
  
      if (!codeAttendance || new Date(codeAttendance.expiration_time) < new Date()) {
        return res.status(400).json({ message: 'Token tidak valid atau sudah kadaluarsa.' });
      }
  
      // Simpan ke database (misalnya tabel presensi)
      // Simpan ke tabel presensi atau yang sesuai
      // Presensi sudah berhasil divalidasi dan disimpan
  
      return res.status(200).json({ message: 'Token valid! Presensi berhasil.' });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Terjadi kesalahan dalam memvalidasi token.' });
    }
  };
 

module.exports = {
    checkAndGenerateCodeAttendance,
    checkAndGenerateFromEventCodeAttendance,
    getAllCodeAttendances,
    getCodeAttendanceById,
    createCodeAttendance,
    updateCodeAttendanceStatus,
    validateQRCode, 
    validateToken
};
