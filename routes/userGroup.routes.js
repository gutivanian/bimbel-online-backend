const express = require('express');
const router = express.Router();
const groupController = require('../controllers/userGroup.controller');

router.get('/', groupController.getAllGroups);

module.exports = router;