const User = require("../models/user.model");
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { Mutex } = require('async-mutex'); // Gunakan library async-mutex untuk queue
const loginMutex = new Mutex(); // Mutex untuk mengontrol akses login
const secretKey = process.env.JWT_SECRET_KEY;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const refreshTokens = [];

// Fungsi untuk mendaftar pengguna baru
exports.create =async (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Content cannot be empty!"
        });
    }

    const { username, email, password, captchaToken } = req.body;

    // Verifikasi CAPTCHA
    try {
        const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`);
        const { success } = response.data;

        if (!success) {
            return res.status(400).send({
                message: "CAPTCHA verification failed. Please try again."
            });
        }
    } catch (error) {
        console.error("Error verifying CAPTCHA:", error);
        return res.status(500).send({
            message: "Error verifying CAPTCHA."
        });
    }

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

exports.createNoCaptcha = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Content cannot be empty!"
        });
    }

    const { username, fullName, email, password, role } = req.body;
    // console.log(req.body);
    // Validasi data input
    if (!username || !email || !password || !fullName) {
        return res.status(400).send({
            message: "Username, full name, email, and password are required!"
        });
    }

    // Role default jika tidak ada
    const userRole = role || 'student';

    // Buat user baru
    const user = new User({ username, fullName, email, password, role: userRole });

    User.create(user, (err, data) => {
        if (err) {
            return res.status(500).send({
                message: err.message || "Some error occurred while creating the User."
            });
        }
        res.status(201).send(data); // Mengembalikan status 201 Created
    });
};

exports.updateUser = (req, res) => {
    console.log('start update user')
    const userId = req.params.id;
    const { username, email, oldPassword, newPassword } = req.body;
    console.log(req.body);
    console.log(req.params.id)
    if (!username || !email || !oldPassword) {
        return res.status(400).json({ message: 'Username, email, and old password are required.' });
    }

    User.updateUser(userId, { username, email, oldPassword, newPassword }, (err, data) => {
        if (err) {
            if (err.kind === 'not_found') {
                return res.status(404).json({ message: 'User not found.' });
            }
            if (err.kind === 'invalid_password') {
                return res.status(400).json({ message: 'Invalid old password.' });
            }
            return res.status(500).json({ message: 'Error updating user.' });
        }

        res.status(200).json({ message: 'User updated successfully.', data });
    });
};

// Delete user by ID
exports.deleteUser = (req, res) => {
    const userId = req.params.id;

    User.deleteUser(userId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                return res.status(404).send({
                    message: `User not found with id ${userId}`
                });
            }
            return res.status(500).send({
                message: `Could not delete user with id ${userId}`
            });
        } 

        res.status(200).send({
            message: `User with id ${userId} was deleted successfully.`
        });
    });
};
 
// Fungsi untuk login pengguna
exports.login = (req, res) => {
    const { username, password } = req.body;

    loginMutex.runExclusive(async () => {
        try {
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
        
        User.updateLastLogin(username,(err, user) => {
            if (err) {
                console.error('Error finding user by username:', err);
                return res.status(500).send({
                    message: err.message || "Some error occurred while finding the User."})}}
                )
        
        // Jika login berhasil, buat token JWT
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, secretKey, { expiresIn: '6h' });
        const refreshToken = jwt.sign({ id: user.id, username: user.username, role: user.role }, refreshTokenSecret,
            { expiresIn: '30d' } // Refresh token berlaku selama 30 hari
            );

        refreshTokens.push(refreshToken);

        // Kirimkan token dalam cookie
        res.cookie('authToken', token, {
            httpOnly: true, // Hanya dapat diakses oleh server
            secure: process.env.NODE_ENV === 'production', // Hanya dikirim melalui HTTPS di production
            sameSite: 'Strict', // Hanya dikirim dalam permintaan yang sama
            maxAge: 6 * 60 * 60 * 1000 // 15 menit dalam milidetik
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, // Hanya dapat diakses oleh server
            secure: process.env.NODE_ENV === 'production', // Hanya dikirim melalui HTTPS di production
            sameSite: 'Strict', // Hanya dikirim dalam permintaan yang sama
            maxAge: 30 * 24 * 60 * 60 * 1000 // 7 hari dalam milidetik
        });

        res.send({
            message: "Login successful!",
            username: user.username,
            role: user.role,
            token
        });
    });
} catch (error) {
    console.error("Error during login:", error);
    res.status(500).send({
        message: "An error occurred during login."
    });
}
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

        const newToken = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '6h' });

        res.cookie('authToken', newToken, {
            httpOnly: true, // Hanya dapat diakses oleh server
            secure: process.env.NODE_ENV === 'production', // Hanya dikirim melalui HTTPS di production
            sameSite: 'Strict', // Hanya dikirim dalam permintaan yang sama
            maxAge: 6 * 60 * 60 * 1000 // 15 menit dalam milidetik
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
        res.send({ user_id: user.user_id, id: user.id });
    });
};

exports.findById = (req, res) => {
    const id = req.params.id;
    console.log('Finding user by id:', id); // Log username yang dicari

    User.findById(id, (err, user) => {
        if (err) {
            console.error('Error finding user by id:', err); // Log error detail
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
        res.send({
            id: user.id,
            username: user.username,
            email: user.email
        });
    });
};
exports.getUserDataByRole = (req, res) => {
    const role = req.params.role;
    console.log('Finding users by role:', role); // Log role yang dicari

    User.getUserDataByRole(role, (err, users) => {
        if (err) {
            console.error('Error finding users by role:', err); // Log error detail
            return res.status(500).send({
                message: err.message || 'Some error occurred while finding the Users.'
            });
        }
        if (!users || users.length === 0) {
            return res.status(404).send({
                message: 'No users found for this role.' 
            });
        }
        console.log('Users found:', users); // Log semua user yang ditemukan
        res.send(users); // Kirimkan semua user dalam bentuk array
    });
};

exports.searchUsersByRoleAndName = async (req, res) => {
    const { searchTerm, role, limit = 10 } = req.body;
    console.log(req.bpdy)
    // Validasi input
    if (!searchTerm || typeof searchTerm !== 'string') {
        return res.status(400).json({ message: "searchTerm diperlukan dan harus berupa string." });
    } 

    if (!role || typeof role !== 'string') {
        return res.status(400).json({ message: "Role diperlukan dan harus berupa string." });
    }

    // Validasi limit
    const parsedLimit = parseInt(limit);
    if (isNaN(parsedLimit) || parsedLimit < 1) {
        return res.status(400).json({ message: "Limit harus berupa angka positif." });
    }

    try {
        const users = await User.searchUsersByRoleAndName(role, searchTerm, parsedLimit);
        res.status(200).json({ users });
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};


exports.searchUsersByMultipleRolesAndName = async (req, res) => {
    const { searchTerm, roles } = req.body;

    if (!searchTerm || typeof searchTerm !== 'string') {
        return res.status(400).json({ message: "searchTerm diperlukan dan harus berupa string." });
    }

    if (!Array.isArray(roles) || roles.length === 0) {
        return res.status(400).json({ message: "Roles harus berupa array dengan setidaknya satu item." });
    }

    try {
        // Pastikan roles dalam format JSON valid
        const parsedRoles = JSON.parse(JSON.stringify(roles));
        const users = await User.searchUsersByRolesAndName(parsedRoles, searchTerm);
        res.status(200).json({ users });
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};
 
 exports.getPaginatedUsers = async (req, res) => {
  try {
    const params = {
      sortField: req.query.sortField || 'id',
      sortOrder: req.query.sortOrder || 'asc',
      search: req.query.search || '',
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      role: req.params.role || '',
      education: req.query.education || '',
      city: req.query.city || '',
      province: req.query.province || '',
      status: req.query.status || ''
    };

    const { users, total } = await User.getPaginatedUsers(params);

    // const processedUsers = users.map((user) => ({
    //   id: user.userid,
    //   user_code: user.user_code,
    //   nama_lengkap: user.nama_lengkap,
    //   email: user.email,
    //   role: user.role,
    //   pendidikan: user.pendidikan,
    //   kota: user.kota,
    //   provinsi: user.provinsi,
    //   status: user.status,
    //   create_date: user.create_date,
    //   create_user: user.create_user,
    //   edit_date: user.edit_date,
    //   edit_user: user.edit_user
    // }));

    res.json({
      data: users,
      total,
      page: parseInt(params.page),
      totalPages: Math.ceil(total / params.limit)
    });
  } catch (error) {
    console.error('Get Paginated Users Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
exports.getTotalUsersAndGrowthByRole = (req, res) => {
    const role = req.query.role;

    if (!role) {
        return res.status(400).send({
            message: 'Role parameter is required.'
        });
    }

    User.getTotalUsersAndGrowthByRole(role, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || 'Some error occurred while fetching total users and growth.'
            });
            return;
        }
        res.send(data); // Kirimkan hasil dalam bentuk JSON
    });
};

// Controller untuk mendapatkan active users dan pertumbuhan berdasarkan role
exports.getActiveUsersAndGrowthByRole = (req, res) => {
    const { role } = req.query;

    if (!role) {
        return res.status(400).send({ message: 'Role parameter is required' });
    }

    User.getActiveUsersAndGrowthByRole(role, (err, data) => {
        if (err) {
            console.error('Error fetching active users and growth:', err);
            return res.status(500).send({ message: 'Error retrieving active users and growth' });
        }
        res.send(data);
    });
};

exports.getNewUsersAndGrowth = (req, res) => {
    const { role } = req.query;

    if (!role) {
        return res.status(400).send({ message: "Role parameter is required." });
    }

    User.getNewUsersAndGrowthByRole(role, (err, data) => {
        if (err) {
            console.error("Error fetching new users and growth:", err);
            return res.status(500).send({
                message: "An error occurred while fetching new users and growth."
            });
        }

        res.send(data);
    });
};
 

exports.getRevenuePerUser = (req, res) => {
    const { role } = req.query;

    if (!role) {
        return res.status(400).send({ message: "Role parameter is required." });
    }

    User.getRevenuePerUser(role, (err, data) => {
        if (err) {
            return res.status(500).send({ message: "Error fetching revenue per user." });
        }

        res.send(data);
    });
};

exports.getStudentPendidikanDistribution = (req, res) => {
    User.getStudentPendidikanDistribution((err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving pendidikan distribution."
            });
        } else {
            res.send(data);
        }
    });
};

exports.getStudentGrowth = (req, res) => {f
    User.getStudentGrowth((err, data) => {
        if (err) {
            res.status(500).send({
                message: "Error retrieving student growth data.",
            });
        } else {
            res.send(data);
        }
    });
};

exports.getUserDetails = (req, res) => {
    const userId = req.params.userId;

    User.getUserDetailsById(userId, (err, data) => {
        if (err) {
            res.status(500).send({
                message: "Error retrieving user details.",
            });
        } else {
            res.status(200).send(data);
        }
    });
};

exports.searchUsersByRoleAndName = async (req, res) => {
    const { searchTerm, role } = req.body;
 
    // Validasi input
    if (!searchTerm || typeof searchTerm !== 'string') {
        return res.status(400).json({ message: "searchTerm diperlukan dan harus berupa string." });
    } 

    if (!role || typeof role !== 'string') {
        return res.status(400).json({ message: "Role diperlukan dan harus berupa string." });
    }

    try {
        const users = await User.searchUsersByRoleAndName(role, searchTerm);
        res.status(200).json({ users });
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};