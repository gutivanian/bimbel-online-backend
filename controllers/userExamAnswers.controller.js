const examModel = require('../models/userExamAnswers.model');

const updateScoreAndAnswers = async (req, res) => {
  const { answers, exam_string, userName } = req.body;
  console.log("Score to Update")
  console.log(req.body)
  try {
    // Get exam based on exam_string
    const exam = await examModel.getExamByExamString(exam_string);

    if (!exam) {
      return res.status(404).send('Exam not found');
    }

    const examId = exam.id;
    const questions = await examModel.getQuestionsByExamId(examId);
    let score = 0;
    const totalQuestions = questions.length;

    // Loop through all questions and calculate the score
    for (const question of questions) {
      const userAnswer = answers[question.id];
      if (!userAnswer) continue; // Skip if no answer

      let userAnswerFormatted;
      let isCorrect = false; // Default is incorrect

      if (Array.isArray(userAnswer)) {
        userAnswerFormatted = `{${userAnswer.join(',')}}`; // Format array answers
      } else {
        userAnswerFormatted = `{${userAnswer}}`; // Format single answer
      }

      // Determine if the user's answer is correct
      if (question.question_type === 'single-choice' && userAnswer === question.correct_answer[0]) {
        score += 1;
        isCorrect = true;
      } else if (question.question_type === 'multiple-choice') {
        const userAnswersSorted = userAnswer.sort();
        const correctAnswersSorted = question.correct_answer.sort();
        if (JSON.stringify(userAnswersSorted) === JSON.stringify(correctAnswersSorted)) {
          score += 1;
          isCorrect = true;
        }
      } else if (question.question_type === 'number' && parseInt(userAnswer, 10) === parseInt(question.correct_answer[0], 10)) {
        score += 1;
        isCorrect = true;
      } else if (question.question_type === 'text' && userAnswer.toLowerCase() === question.correct_answer[0].toLowerCase()) {
        score += 1;
        isCorrect = true;
      } else if (question.question_type === 'true-false') {
        const correctAnswersBoolean = question.correct_answer.map(answer => answer === 'true');
        if (JSON.stringify(userAnswer) === JSON.stringify(correctAnswersBoolean)) {
          score += 1;
          isCorrect = true;
        }
      }

      // Update or insert the user's answer
      await examModel.upsertUserAnswer(examId, question.id, userName, userAnswerFormatted, isCorrect);
    }

    // Update or insert the user's score
    await examModel.upsertUserExamScore(examId, userName, score, totalQuestions);

    res.json({ score, totalQuestions });
  } catch (error) {
    console.error('Error during grading:', error);
    res.status(500).send('Internal Server Error');
  }
};

const submitAnswers = async (req, res) => {
  const { answers, exam_string, userName } = req.body;
  console.log("Score to Submit")
  console.log(req.body)

  try {
    // Get exam based on exam_string
    const exam = await examModel.getExamByExamString(exam_string);
    console.log('Exam to submit:')
    console.log(exam)
    if (!exam) {
      return res.status(404).send('Exam not found');
    }

    const examId = exam.id;
    const questions = await examModel.getQuestionsByExamId(examId);
    let score = 0;
    const totalQuestions = questions.length;
    console.log(examId)
    // Loop through all questions and save answers
    for (const question of questions) {
      const userAnswer = answers[question.id];
      if (!userAnswer) continue;

      let userAnswerFormatted;
      let isCorrect = false; // Default is false

      // Format the user answer
      if (Array.isArray(userAnswer)) {
        userAnswerFormatted = `{${userAnswer.join(',')}}`; // Format array answers
      } else {
        userAnswerFormatted = `{${userAnswer}}`; // Format single answer as array
      }

      // Logic for grading the answer
      if (question.question_type === 'single-choice' && userAnswer === question.correct_answer[0]) {
        score += 1;
        isCorrect = true;
      } else if (question.question_type === 'multiple-choice') {
        const userAnswersSorted = userAnswer.sort();
        const correctAnswersSorted = question.correct_answer.sort();
        if (JSON.stringify(userAnswersSorted) === JSON.stringify(correctAnswersSorted)) {
          score += 1;
          isCorrect = true;
        }
      } else if (question.question_type === 'number' && parseInt(userAnswer, 10) === parseInt(question.correct_answer[0], 10)) {
        score += 1;
        isCorrect = true;
      } else if (question.question_type === 'text' && userAnswer.toLowerCase() === question.correct_answer[0].toLowerCase()) {
        score += 1;
        isCorrect = true;
      } else if (question.question_type === 'true-false') {
        const correctAnswersBoolean = question.correct_answer.map(answer => answer === 'true');
        if (JSON.stringify(userAnswer) === JSON.stringify(correctAnswersBoolean)) {
          score += 1;
          isCorrect = true;
        }
      }

      // Insert or update the user answer
      await examModel.upsertUserAnswer(examId, question.id, userName, userAnswerFormatted, isCorrect);
    }
    console.log("testing")
    // Insert user exam score
    await examModel.upsertUserExamScore(examId,userName, score, totalQuestions);

    res.json({ score, totalQuestions });
  } catch (error) {
    console.error('Error during submission:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  updateScoreAndAnswers,
  submitAnswers,
};
