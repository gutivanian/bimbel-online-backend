const userExamModel = require('../models/userExam.model');

const checkUserExam = async (req, res) => {
  const { userName, exam_string } = req.body;

  try {
    const exists = await userExamModel.checkUserExam(userName, exam_string);
    
    if (exists === null) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    res.json({ exists });
  } catch (error) {
    console.error('Error checking user exam:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  checkUserExam,
};
