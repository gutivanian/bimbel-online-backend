const pool = require('../config/db.config');

// Get exam by exam_string
const getExamByExamString = async (exam_string) => {
  try {
    const result = await pool.query('SELECT * FROM exams WHERE exam_string = $1', [exam_string]);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching exam by exam_string:', error);
    throw error;
  }
};

// Get questions by exam_id
const getQuestionsByExamId = async (examId) => {
  try {
    const result = await pool.query('SELECT * FROM questions WHERE exam_id = $1', [examId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching questions by exam_id:', error);
    throw error;
  }
};

// Get user answer by exam_id, question_id, and user_name
const getUserAnswer = async (examId, questionId, userName) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_answers WHERE exam_id = $1 AND question_id = $2 AND user_name = $3',
      [examId, questionId, userName]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching user answer:', error);
    throw error;
  }
};

// Update or insert user answer
const upsertUserAnswer = async (examId, questionId, userName, userAnswer, isCorrect) => {
  try {
    const existingAnswer = await getUserAnswer(examId, questionId, userName);
    if (existingAnswer) {
      await pool.query(
        'UPDATE user_answers SET user_answer = $1, is_correct = $2 WHERE exam_id = $3 AND question_id = $4 AND user_name = $5',
        [userAnswer, isCorrect, examId, questionId, userName]
      );
    } else {
      await pool.query(
        'INSERT INTO user_answers (exam_id, question_id, user_answer, user_name, is_correct) VALUES ($1, $2, $3, $4, $5)',
        [examId, questionId, userAnswer, userName, isCorrect]
      );
    }
  } catch (error) {
    console.error('Error upserting user answer:', error);
    throw error;
  }
};

// Get user exam score 
const getUserExamScore = async (examId, userName) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_exam_scores WHERE exam_id = $1 AND user_name = $2',
      [examId, userName]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching user exam score:', error);
    throw error;
  }
};

// Update or insert user exam score
const upsertUserExamScore = async (examId, userName, score, totalQuestions) => {
  try {
    const existingScore  = await getUserExamScore(examId, userName);
    
    if (existingScore) {
      await pool.query(
        'UPDATE user_exam_scores SET score = $1, completion_time = NOW(), total_questions = $2 WHERE exam_id = $3 AND user_name = $4',
        [score, totalQuestions, examId, userName]
      );
    } else {
      await pool.query(
        'INSERT INTO user_exam_scores (user_name, exam_id, score, completion_time, total_questions) VALUES ($1, $2, $3, NOW(), $4)',
        [userName, examId, score, totalQuestions]
      );
    }
  } catch (error) {
    console.error('Error upserting user exam score:', error);
    throw error;
  }
};

module.exports = {
  getExamByExamString,
  getQuestionsByExamId,
  getUserAnswer,
  upsertUserAnswer,
  getUserExamScore,
  upsertUserExamScore,
};
