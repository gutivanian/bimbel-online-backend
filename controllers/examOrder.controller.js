const examOrderModel = require('../models/examOrder.model');

// Function to shuffle array (randomize exam order)
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Get or create exam order for a user based on exam names
const getExamOrder = async (req, res) => {
  const { userName, scheduleId } = req.body;

  try {
    // Fetch exam_id_list from exam_schedule based on the provided scheduleId
    const examSchedule = await examOrderModel.getExamIdListFromSchedule(scheduleId);
    
    if (!examSchedule) {
      return res.status(404).json({ error: 'Exam schedule not found' });
    }

    const examIdList = examSchedule.exam_id_list; // Get array of exam IDs

    // Fetch the corresponding exam names based on the exam IDs
    const examNames = await examOrderModel.getExamNamesByIds(examIdList);

    // Check if exam order exists for the user
    const existingOrder = await examOrderModel.getExamOrderByUserName(userName, scheduleId);
    let examOrder;

    if (existingOrder) {
      // If exam order exists, use it
      examOrder = existingOrder.exam_order;
    } else {
      // Shuffle the exam names
      examOrder = shuffleArray(examNames);

      // Save the new shuffled exam order (by exam names) in the database
      await examOrderModel.createExamOrder(userName, examOrder, scheduleId);
    }

    // Get the details of the exams (exam_string, name, and duration) using the exam names
    const examDetails = await examOrderModel.getExamDetailsByNames(examOrder);

    // Return the exam details
    res.json({ examOrder: examDetails });
  } catch (error) {
    console.error('Error getting or creating exam order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getExamOrder,
};
