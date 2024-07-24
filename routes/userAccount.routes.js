const express = require('express');
const router = express.Router();
const userAccountController = require('../controllers/userAccount.controller');
const authenticateJWT = require('../middleware/authenticateToken');

// Route untuk menyimpan atau memperbarui data user account
router.post('/save-account', authenticateJWT, (req, res, next) => {
    console.log('Hit /save-account route');
    next();
}, userAccountController.saveUserAccount);

// Route untuk mengambil data user account berdasarkan user_id
router.get('/:user_id', authenticateJWT, userAccountController.getUserAccount);

// Route untuk mengambil semua data user account
router.get('/', authenticateJWT, userAccountController.getAllUserAccounts);

// Route untuk menghapus data user account berdasarkan user_id
router.delete('/:user_id', authenticateJWT, userAccountController.deleteUserAccount);

module.exports = router;
