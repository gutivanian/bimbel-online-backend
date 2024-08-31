// controllers/userTryoutTestController.js

const userTryoutTestService = require('../models/userTryoutTest.model');

// Check if a user tryout test record exists
exports.checkUserTest = async (req, res) => {
  const { user_id, test_id } = req.params;

  try {
    const userTest = await userTryoutTestService.checkUserTest(user_id, test_id);

    if (userTest) {
      res.status(200).json(userTest);
    } else {
      res.status(404).json({ message: 'No record found.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
};

exports.checkUserTestByTestName = async (req, res) => {
  const { user_id, test_name } = req.params;
  console.log(user_id, test_name);

  try {
    const userTest = await userTryoutTestService.checkUserTestByTestName(user_id,test_name);

    if (userTest) {
      res.status(200).json(userTest);
    } else {
      res.status(404).json({ message: 'No record found.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  } 
  finally {
    console.log("done")
  }
};

// Create a new user tryout test record
exports.createUserTest = async (req, res) => {
  const { user_id, test_id, test_array } = req.body;

  try {
    const existingTest = await userTryoutTestService.checkUserTest(user_id, test_id);

    if (existingTest) {
      return res.status(400).json({ message: 'Test already started.' });
    }

    const newUserTest = await userTryoutTestService.createUserTest(user_id, test_id, test_array);
    res.status(201).json(newUserTest);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
};
