const express = require("express")
const router = express.Router()
const result = require("../controllers/result")
const { validationOfAnswers, isStudent, isLoggedIn, isTeacher, isAttemptor, yourResult, MyResult } = require("../middleware")
const catchAsync = require("../utils/catchAsync")

// Result of a test created by a particular teacher
router.get("/teacher", isLoggedIn, isTeacher, catchAsync(result.TestOfParticularTeacher));

router.post("/:testId", isLoggedIn, isStudent, isAttemptor, validationOfAnswers, catchAsync(result.attempting))
//Preventing student to access other students results create a middleware


// All attempts for a specific test
router.get("/test/:testId", isLoggedIn, isTeacher, catchAsync(result.allAttempsForSpecificTest))

//Full result with question-level breakdown
router.get("/detail/:attemptId", isLoggedIn, yourResult, catchAsync(result.FullResult))

router.get("/start/:testId", isLoggedIn, isStudent, catchAsync(result.startTestAttempt))

//List of all attempts by a student
router.get("/:studentId", isLoggedIn, MyResult, catchAsync(result.allAttempsByStudent))


module.exports = router