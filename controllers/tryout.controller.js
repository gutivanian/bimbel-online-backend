// controllers/testController.js
const TryOut = require('../models/tryout.model'); // Import the TryOut model

// Controller function to get test details and subjects
const getTestDetails = async (req, res) => {
    const { testName } = req.params; // Extract testName from request parameters
    
    try {
        // Fetch test details using the model function
        const test = await TryOut.getTestByName(testName);
        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }

        // Fetch subjects for the test
        const subjects = await TryOut.getSubjectsByTestId(test.id);

        // Send the test and subjects as a response
        res.json({ test, subjects });
    } catch (error) {
        // Log and handle errors appropriately
        console.error('Error fetching test data:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getTestDetails,
};
