const mongoose = require('mongoose');
const Question = require("./questionSchema");
// const User=require("./User")


const testSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "title is required"],
    },
    timeLimit: {
        type: Number,
        required: true,
        min: [1, 'Time limit must be at least 1 minute'],
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }]
}, { timestamps: true });

testSchema.post("findOneAndDelete", async function (doc) {
    if (doc.questions) {
        const questions = doc.questions
        const q = await Question.deleteMany({ _id: { $in: questions } })
    }
})

module.exports = mongoose.model('Test', testSchema);
