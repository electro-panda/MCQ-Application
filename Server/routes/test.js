const express = require("express");
const router = express.Router();
const test = require("../controllers/test");
const catchAsync = require("../utils/catchAsync");
const { validationOfTest, isTeacher, isLoggedIn, isCreator } = require("../middleware")

router.route("/")
    .get(isLoggedIn, catchAsync(test.allTest))
    .post(isLoggedIn, isTeacher, validationOfTest, catchAsync(test.newTest))

router.route("/:id")
    .get(isLoggedIn, catchAsync(test.showTest))
    .put(isLoggedIn, isTeacher, isCreator, validationOfTest, catchAsync(test.editTest))
    .delete(isLoggedIn, isTeacher, isCreator, catchAsync(test.deleteTest))

module.exports = router
