const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose")



const userSchema = new mongoose.Schema({
    rollno: {
        type: Number,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'teacher'], // <-- ENUM here
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    }
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);