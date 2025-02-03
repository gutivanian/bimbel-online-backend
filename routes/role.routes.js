// routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');

// Route untuk mencari role
router.post('/search', roleController.searchRoles);

module.exports = router;
