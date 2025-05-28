const { testSchema, resultSchema } = require("./schema");
const ExpressError = require("./utils/ExpressError");
const Test = require("./models/testmodel");
const Result = require("./models/result");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, message: "You must be signed in" });
    }
    next();
}

module.exports.isTeacher = (req, res, next) => {
    if (!req.user || req.user.role !== "teacher") {
        return res.status(403).json({ success: false, message: "Access denied. Teachers only." });
    }
    next();
};

module.exports.isStudent = (req, res, next) => {
    if (!req.user || req.user.role !== "student") {
        return res.status(403).json({ success: false, message: "Access denied. Students can only Attempt." });
    }

    next();
};


module.exports.validationOfTest = (req, res, next) => {
    const { error } = testSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    next();
}

module.exports.validationOfAnswers = (req, res, next) => {
    const { error } = resultSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    next();
}

module.exports.isCreator = async (req, res, next) => {
    const { id } = req.params;
    const test = await Test.findById(id);
    if (!test.createdBy.equals(req.user._id)) {
        return res.status(401).json({ success: false, message: "You are not the Creator" })
    }
    next();
}

module.exports.isAttemptor = async (req, res, next) => {
    if (req.user.role == "student") {
        const { testId } = req.params;
        const hasAttempted = await Result.findOne({
            test: testId,
            attemptedBy: req.user._id
        });
        if (hasAttempted) {
            return res.status(403).json({ success: false, attempted: true, message: "Already Attempted" });
        } else {
            return next()
        }
    }
    else {
        return next();
    }
}

module.exports.yourResult = async (req, res, next) => {
    if (req.user.role == "student") {
        const { attemptId } = req.params;
        const hasAttempted = await Result.findOne({
            _id: attemptId,
            attemptedBy: req.user._id
        });
        if (hasAttempted) {
            return next()
        } else {
            return res.status(403).json({ success: false, message: "Sorry you can't view others results" })
        }
    } else {
        return next()
    }
}

module.exports.MyResult = async (req, res, next) => {
    if (req.user.role == "student") {
        const { studentId } = req.params;
        if (req.user._id.equals(studentId)) {
            return next();
        } else {
            res.status(403).json({
                success: false,
                message: "You can't access another students data"
            })
        }

    } else {
        return next()
    }
}