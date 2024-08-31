// routes/userTryoutTestRoutes.js

const express = require('express');
const router = express.Router();
const userTryoutTestController = require('../controllers/userTryoutTest.controller');

// Route to check if a user test record exists
router.get('/:user_id/test_id/:test_id', userTryoutTestController.checkUserTest);
router.get('/:user_id/test_name/:test_name', userTryoutTestController.checkUserTestByTestName);

// Route to create a new user test record
router.post('/', userTryoutTestController.createUserTest);

module.exports = router;
