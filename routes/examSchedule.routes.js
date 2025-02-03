const express = require('express'); 
const router = express.Router();
const examScheduleController = require('../controllers/examSchedule.controller');

// Get all exam schedules with filters, sorting, and pagination
router.get('/search', examScheduleController.searchExamSchedules);
router.get('/all', examScheduleController.getExamSchedules);
 
// Get all valid exam schedules (is_valid = true)
router.get('/', examScheduleController.getValidExamSchedules);

// Get a specific exam schedule by ID
router.get('/:id', examScheduleController.getExamScheduleById);

// Get exam schedules by exam type
router.get('/type/:examtype', examScheduleController.getExamSchedulesByType);

// Create a new exam schedule
router.post('/', examScheduleController.createExamSchedule);

// Update an exam schedule
router.put('/:id', examScheduleController.updateExamSchedule);

// Delete an exam schedule
router.delete('/:id', examScheduleController.deleteExamSchedule);

router.post('/checkAccess', examScheduleController.checkExamAccess);

module.exports = router; 
