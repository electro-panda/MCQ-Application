const User = require("../models/User")
const passport = require("passport")

module.exports.register = async (req, res) => {
    try {
        const data = {
            rollno: req.body.rollno,
            username: req.body.username,
            role: req.body.role,
            email: req.body.email
        }
        const user = new User(data);
        const newUser = await User.register(user, req.body.password)
        req.login(newUser, (err) => {
            if (err) return next(err);
            res.json({ user: { ...newUser }, success: true, message: "Registered Successfully" });
        })
    } catch (e) {
        res.status(400).json({ success: false, message: e.message })
    }
}

module.exports.login = async (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err); // server error
        if (!user) {
            return res.status(401).json({
                success: false,
                message: info?.message || "Invalid credentials"
            });
        }

        req.login(user, (err) => {
            if (err) return next(err);
            return res.status(200).json({
                success: true,
                message: "Logged in successfully",
                user: {
                    id: user._id,
                    username: user.username,
                    role: user.role
                    // include other public fields you want
                }
            });
        });
    })(req, res, next);
}

module.exports.logout = async (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.status(200).json({ success: true, message: 'Successfully Logged out!' });
    });
}

module.exports.currentUser = async (req, res) => {
    const user = await User.findById(req.user._id)
    res.json({
        success: true,
        user: {
            _id: user._id,
            username: user.username,
            role: user.role,
            email: user.email,
            rollno: user.rollno
        }
    });
}