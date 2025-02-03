const Course = require('../models/course.model');

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.getAll();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchAllCourses = async (req, res) => {
  try {
    const search = req.query.search || '';
    const courses = await Course.searchAll(search);
    // Hanya kirim id dan title untuk keperluan pencarian
    const simplifiedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
    }));
    res.json(simplifiedCourses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.update(req.params.id, req.body);
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message }); 
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    await Course.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
