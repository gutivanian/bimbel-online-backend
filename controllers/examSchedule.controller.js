const examScheduleModel = require('../models/examSchedule.model');

// Get exam schedules with filters, sorting, and pagination
const getExamSchedules = async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 999,
      search: req.query.search || '',
      exam_type: req.query.exam_type || 'All',
      group_product: req.query.group_product || 'All',
      series: req.query.series || 'All',
      isfree: req.query.isfree || 'All',
      is_valid: req.query.is_valid || 'All',
      start_time: req.query.start_time || null,
      end_time: req.query.end_time || null,
      sortKey: req.query.sortKey || 'es.id',
      sortOrder: req.query.sortOrder || 'asc',
      userId: req.query.userId || null, // New Filter
    }; 
    // console.log(filters);

    const result = await examScheduleModel.getExamSchedules(filters);
    // console.log(result)
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching exam schedules:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// controllers/examSchedule.controller.js

const searchExamSchedules = async (req, res) => {
  const { search = '', limit = 10, userId = null } = req.query; // Extract userId
  console.log(req.query); //
  try {
    const schedules = await examScheduleModel.searchExamSchedules(search, parseInt(limit, 10), userId);
    res.status(200).json({ data: schedules });
  } catch (error) {
    console.error('Error searching exam schedules:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



// Get all valid exam schedules (is_valid = true)
const getValidExamSchedules = async (req, res) => {
  try {
    const schedules = await examScheduleModel.getValidExamSchedules();
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get exam schedule by ID
const getExamScheduleById = async (req, res) => {
  const { id } = req.params;
  try {
    const schedule = await examScheduleModel.getExamScheduleById(id);
    if (!schedule) {
      return res.status(404).json({ message: 'Exam schedule not found' });
    }
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get exam schedules by exam type
const getExamSchedulesByType = async (req, res) => {
  const { examtype } = req.params;
  try {
    const schedules = await examScheduleModel.getExamSchedulesByType(examtype);
    if (!schedules.length) {
      return res.status(404).json({ message: `No schedules found for exam type: ${examtype}` });
    }
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new exam schedule
const createExamSchedule = async (req, res) => {
  const { name, description, exam_id_list, start_time, end_time,isfree, is_valid, created_by, exam_type } = req.body;
  try {
    const newSchedule = await examScheduleModel.createExamSchedule(name, description, exam_id_list, start_time, end_time,isfree, is_valid, created_by, exam_type);
    res.status(201).json(newSchedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing exam schedule
const updateExamSchedule = async (req, res) => {
  const { id } = req.params;
  const { name, description, exam_id_list, start_time, end_time, is_valid, updated_by, exam_type } = req.body;
  try {
    const updatedSchedule = await examScheduleModel.updateExamSchedule(id, name, description, exam_id_list, start_time, end_time, is_valid, updated_by, exam_type);
    if (!updatedSchedule) {
      return res.status(404).json({ message: 'Exam schedule not found' });
    }
    res.status(200).json(updatedSchedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an exam schedule
const deleteExamSchedule = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSchedule = await examScheduleModel.deleteExamSchedule(id);
    if (!deletedSchedule) {
      return res.status(404).json({ message: 'Exam schedule not found' });
    }
    res.status(200).json({ message: 'Exam schedule deleted', schedule: deletedSchedule });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Endpoint untuk memeriksa akses ke ujian
 * @param {Request} req - Request yang berisi username dan examId
 * @param {Response} res - Response untuk mengirimkan hasil akses
 */
const checkExamAccess = async (req, res) => {
  const { username, examId } = req.body;
  console.log(req.body)
  
  try {
    const access = await examScheduleModel.checkAccess(username, examId);

    if (access.accessGranted) {
      res.status(200).json({ message: 'Access granted to the exam' });
    } else {
      res.status(403).json({ message: 'Access denied. Purchase required.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  checkExamAccess,
  getExamSchedules,
  
  searchExamSchedules,
  getValidExamSchedules,
  getExamScheduleById,
  getExamSchedulesByType,
  createExamSchedule,
  updateExamSchedule,
  deleteExamSchedule,
};
 