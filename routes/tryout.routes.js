// routes/testRoutes.js
const express = require('express');
const { getTestDetails } = require('../controllers/tryout.controller'); // Import the controller function

const router = express.Router();

// Define the route for getting test details and subjects
router.get('/test/:testName', getTestDetails);

module.exports = router;
