const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    options: {
        type: [String],
        required: true,
        validate: [arr => arr.length === 4, 'Exactly 4 options required']
    },
    correctAnswer: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, { timestamps: true });


module.exports = mongoose.model('Question', questionSchema);