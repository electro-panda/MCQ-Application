const Question = require("../models/questionSchema")
const Test = require("../models/testmodel")
const User = require("../models/User")
const ExpressError = require("../utils/ExpressError")


//For all test
module.exports.allTest = async (req, res) => {
    const list = await Test.find().populate("createdBy");
    res.json(list);
}

module.exports.newTest = async (req, res) => {
    let question = req.body.test.questions
    if (typeof question[0] === "string") {
        // Convert each JSON string into an object
        question = question.map(q => JSON.parse(q));
    }

    question = question.map(q => ({ ...q, createdBy: req.user._id }));
    //this automatically saves the data to the database
    const questionSchema = await Question.insertMany(question);
    const testData = {
        title: req.body.test.title,
        timeLimit: req.body.test.timestamp,
        questions: questionSchema.map(q => q._id),
        createdBy: req.user._id
    }
    const test = new Test(testData);
    await test.save();
    res.json({ id: test._id });
}

module.exports.showTest = async (req, res) => {
    const { id } = req.params;
    const test = await Test.findById(id).populate("questions").populate("createdBy");
    if (!test) {
        throw new ExpressError("No Such Test Exist", 400)
    }
    res.json(test);
}

module.exports.editTest = async (req, res) => {
    const { id } = req.params;
    let question = req.body.test.questions;
    if (typeof question[0] === "string") {
        // Convert each JSON string into an object
        question = question.map(q => JSON.parse(q));
    }
    //Deleting the question Schema Data
    const deleteQuestion = await Test.findById(id);
    //Deleting the questions data
    const q = await Question.deleteMany({ _id: { $in: deleteQuestion.questions } })
    // this automatically saves the data to the database
    question = question.map(q => ({ ...q, createdBy: req.user._id }));
    const questionSchema = await Question.insertMany(question);
    const testData = {
        title: req.body.test.title,
        timeLimit: req.body.test.timestamp,
        questions: questionSchema.map(q => q._id),
        createdBy: req.user._id
    }
    const test = await Test.findByIdAndUpdate(id, testData, { new: true })
    res.json({ updated: "true" });
}

module.exports.deleteTest = async (req, res) => {
    const { id } = req.params;
    const deleteTest = await Test.findByIdAndDelete(id);
    res.json(deleteTest);
}

