const User = require("../models/user.model");
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET_KEY;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const refreshTokens = [];

// Fungsi untuk mendaftar pengguna baru
exports.create = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Content cannot be empty!"
        });
    }

    const { username, email, password } = req.body;

    // Buat user baru
    const user = new User({ username, email, password });

    User.create(user, (err, data) => {
        if (err) {
            return res.status(500).send({
                message: err.message || "Some error occurred while creating the User."
            });
        }
        res.status(201).send(data); // Mengembalikan status 201 Created
    });
};

// Fungsi untuk login pengguna
exports.login = (req, res) => {
    const { username, password } = req.body;

    User.findByUsername(username, (err, user) => {
        if (err) {
            console.error('Error finding user by username:', err);
            return res.status(500).send({
                message: err.message || "Some error occurred while finding the User."
            });
        }

        if (!user) {
            return res.status(404).send({
                message: "User not found."
            });
        }

        // Cek apakah password cocok
        if (user.password !== password) {
            return res.status(401).send({
                message: "Invalid password."
            });
        }

        // Jika login berhasil, buat token JWT
        const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user.id, username: user.username }, refreshTokenSecret);

        refreshTokens.push(refreshToken);

        // Kirimkan token dalam cookie
        res.cookie('authToken', token, {
            httpOnly: true, // Hanya dapat diakses oleh server
            secure: process.env.NODE_ENV === 'production', // Hanya dikirim melalui HTTPS di production
            sameSite: 'Strict', // Hanya dikirim dalam permintaan yang sama
            maxAge: 15 * 60 * 1000 // 15 menit dalam milidetik
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, // Hanya dapat diakses oleh server
            secure: process.env.NODE_ENV === 'production', // Hanya dikirim melalui HTTPS di production
            sameSite: 'Strict', // Hanya dikirim dalam permintaan yang sama
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 hari dalam milidetik
        });

        res.send({
            message: "Login successful!",
            username: user.username,
            token // Include token in response
        });
    });
};

// Fungsi untuk refresh token
exports.refreshToken = (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken || !refreshTokens.includes(refreshToken)) {
        return res.sendStatus(403);
    }

    jwt.verify(refreshToken, refreshTokenSecret, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }

        const newToken = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '15m' });

        res.cookie('authToken', newToken, {
            httpOnly: true, // Hanya dapat diakses oleh server
            secure: process.env.NODE_ENV === 'production', // Hanya dikirim melalui HTTPS di production
            sameSite: 'Strict', // Hanya dikirim dalam permintaan yang sama
            maxAge: 15 * 60 * 1000 // 15 menit dalam milidetik
        });

        res.send({
            token: newToken
        });
    });
};

// Fungsi untuk logout pengguna
exports.logout = (req, res) => {
    const { refreshToken } = req.cookies;
    const index = refreshTokens.indexOf(refreshToken);
    if (index > -1) {
        refreshTokens.splice(index, 1);
    }
    res.clearCookie('authToken');
    res.clearCookie('refreshToken');
    res.send({ message: "Logout successful!" });
};

// Fungsi untuk mendapatkan user_id berdasarkan username
exports.findByUsername = (req, res) => {
    const username = req.params.username;
    console.log('Finding user by username:', username); // Log username yang dicari

    User.findByUsername(username, (err, user) => {
        if (err) {
            console.error('Error finding user by username:', err); // Log error detail
            return res.status(500).send({
                message: err.message || 'Some error occurred while finding the User.'
            });
        }
        if (!user) {
            return res.status(404).send({
                message: 'User not found.'
            });
        }
        console.log('User found:', user); // Log user yang ditemukan
        res.send({ user_id: user.user_id });
    });
};
