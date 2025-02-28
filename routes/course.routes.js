const express = require('express');
const courseController = require('../controllers/course.controller');

const router = express.Router();

router.get('/', courseController.getAllCourses);
router.get('/search', courseController.searchAllCourses);
router.get('/filter/:grp', courseController.getFilterCourses);
router.post('/', courseController.createCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

module.exports = router;
  