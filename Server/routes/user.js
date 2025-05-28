const express = require("express");
const router = express.Router()
const user = require("../controllers/user")
const { isLoggedIn } = require("../middleware")
const catchAsync = require("../utils/catchAsync")

router.get("/current-user", isLoggedIn, catchAsync(user.currentUser));

router.post("/register", catchAsync(user.register));

router.post("/login", catchAsync(user.login))

router.get('/logout', isLoggedIn, catchAsync(user.logout));

module.exports = router;