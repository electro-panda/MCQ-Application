const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
    test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true
    },
    attemptedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 0
    },
    passed: {
        type: Boolean
    },
    answered: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
            required: true
        },
        selectedOption: {
            type: String,
            default: ""
        },
        isCorrect: {
            type: Boolean,
            required: true
        }
    }]
}, { timestamps: true })

module.exports = mongoose.model("Result", resultSchema)