    const pool = require("../config/db.config");
    require('dotenv').config();


    const TryOut = {// Function to get test details by name
        getTestByName : async (testName) => {
            const testResult = await pool.query('SELECT * FROM test WHERE name = $1', [testName]);
            return testResult.rows[0];
        },

        // Function to get subjects by test ID
        getSubjectsByTestId : async (testId) => {
            const subjectsResult = await pool.query('SELECT * FROM subjects WHERE test_id = $1', [testId]);
            return subjectsResult.rows;
        },

    }

    module.exports = TryOut;