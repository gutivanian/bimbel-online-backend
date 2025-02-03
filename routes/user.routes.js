const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticateJWT = require('../middleware/authenticateToken'); // Pastikan pathnya benar
const authenticateRole = require('../middleware/authenticateRole'); // Import authenticateRole

// Rute untuk memeriksa autentikasi 
router.get('/check-auth', authenticateJWT, (req, res) => {
    console.log('Authenticated user:', req.user);
    res.send({ isAuthenticated: true, username: req.user.username });
});

// Rute untuk mendapatkan user_id berdasarkan username
router.get('/username/:username', authenticateJWT, authenticateRole(['admin', 'student']), userController.findByUsername);
 
router.put('/:id', userController.updateUser);

// Route untuk delete user by id (added route)
router.delete('/:id', authenticateJWT, authenticateRole(['admin']), userController.deleteUser);  // Only admin can delete users


router.get('/:id', userController.findById);

// Rute login   
router.post('/login', userController.login);
 
// Rute register
router.post('/register', userController.create);
router.post('/register-no-captcha', userController.createNoCaptcha);


// Rute logout
router.post('/logout', userController.logout);

// Rute refresh token
router.post('/refresh-token', userController.refreshToken);

// Contoh rute yang hanya bisa diakses oleh admin
router.get('/admin/dashboard', authenticateJWT, authenticateRole(['admin']), (req, res) => {
    res.send('Welcome to the admin dashboard!');
});
 
// Route untuk mendapatkan data user berdasarkan role
 
router.get('/role/all/:role', userController.getUserDataByRole);

router.get('/role/:role', userController.getPaginatedUsers);

router.post('/users/search', userController.searchUsersByRoleAndName);
router.post('/search-by-roles', userController.searchUsersByMultipleRolesAndName);


// Tambahkan route untuk total users dan growth berdasarkan role
router.get('/dashboard/total-users', 
    // authenticateJWT, authenticateRole(['admin']),
 userController.getTotalUsersAndGrowthByRole);

 // Route untuk mendapatkan active users dan growth
router.get('/dashboard/active-users', userController.getActiveUsersAndGrowthByRole);

// Route untuk mendapatkan data pengguna baru dan pertumbuhan
router.get('/dashboard/new-users', userController.getNewUsersAndGrowth);

router.get('/dashboard/revenue-per-user', userController.getRevenuePerUser);

// Route untuk mendapatkan distribusi pendidikan
router.get('/dashboard/student-pendidikan-distribution', userController.getStudentPendidikanDistribution);

// Route for student growth
router.get("/dashboard/student-growth", userController.getStudentGrowth);

router.get("/:userId/details", userController.getUserDetails);


module.exports = router;
