const Test = require("../models/testmodel")
const Result = require("../models/result");


//Start Test
module.exports.startTestAttempt = async (req, res) => {
    const { testId } = req.params;
    const test = await Test.findById(testId)
    req.session.quiz = {
        startedAt: Date.now(),
        timeLimit: test.timeLimit * 60 * 1000//min to ms
    }
    res.status(200).json({ success: true, message: "Test Started" })
}

module.exports.TestOfParticularTeacher = async (req, res) => {
    const teacherId = req.user._id;

    const results = await Result.find()
        .populate({
            path: "test",
            match: { createdBy: teacherId } // Only include tests created by this teacher
        })
        .populate("attemptedBy");

    // Filter out attempts where test was not created by current teacher (due to match above)
    const filteredResults = results.filter(result => result.test !== null);

    res.json(filteredResults);
}

//for attempting
module.exports.attempting = async (req, res) => {
    const { testId } = req.params;
    const { answers } = req.body;

    //checking for time
    const { startedAt, timeLimit } = req.session.quiz;
    if (Date.now() - startedAt > timeLimit) {
        res.status(400).json({ success: false, message: "Time's Up!" })
    }

    const test = await Test.findById(testId).populate("questions");
    if (!test) return res.status(404).json({ error: "Test not found" })
    let score = 0;
    const detailedAnswers = answers.map(answer => {
        const question = test.questions.find(q => q._id.toString() === answer.questionId);
        const isCorrect = question && question.correctAnswer === answer.selectedOption;
        if (isCorrect) score++;
        return {
            questionId: answer.questionId,
            selectedOption: answer.selectedOption,
            isCorrect: !!isCorrect
        };
    });
    console.log(req.user)
    const pass = () => (detailedAnswers.length / 2 <= score)
    const result = {
        test: testId,
        //Attempted by is hard coded remember to change that
        attemptedBy: req.user._id,
        answered: detailedAnswers,
        score: score,
        passed: pass()
    }
    const attempt = new Result(result);
    await attempt.save();
    res.json({
        message: "Attempt submitted",
        score,
        total: test.questions.length,
        attemptId: attempt._id,
        attempt: attempt
    })
}

//List of all attempts by a student
module.exports.allAttempsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const list = await Result.find({ attemptedBy: studentId }).populate("test");
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch attempted tests." });
    }
}

// All attempts for a specific test
module.exports.allAttempsForSpecificTest = async (req, res) => {
    const { testId } = req.params;
    const list = await Result.find({ test: testId }).lean();
    res.json(list);
}

//Full result with question-level breakdown
module.exports.FullResult = async (req, res) => {
    const { attemptId } = req.params;
    const detailedResult = await Result.findById(attemptId).populate({
        path: 'answered.questionId',
        model: 'Question'
    })
        .populate('test')
        .populate('attemptedBy');;
    res.json(detailedResult);
}
