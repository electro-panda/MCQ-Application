if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}


const express = require('express');
const mongoose = require('mongoose');
// const dotenv = require('dotenv');
const cors = require('cors');
// const mongosantize = require("express-mongo-sanitize")
const sanitizeV5 = require('./utils/mongoSanitizeV5.js');

const User = require("./models/User")

const test = require("./routes/test")
const result = require("./routes/result")
const users = require("./routes/user")


//Session
const session = require("express-session")
const MongoStore = require('connect-mongo');

//Authentication
const passport = require("passport")
const LocalStrategy = require("passport-local")
const helmet = require("helmet")


//from .env file
const dbUrl = process.env.db_URL || "mongodb://127.0.0.1:27017/MCQtrial"
const frontend = process.env.FRONTEND_URL || "http://localhost:5173"
const secret = process.env.SECRET || "thisshouldbeasecret"
const port = process.env.PORT || 3000



//Utils Error Handlers
const ExpressError = require("./utils/ExpressError")
// dotenv.config();

const app = express();
app.set('trust proxy', 1); // Trust Render’s proxy


app.set('query parser', 'extended');

// app.use(mongosantize)
//to allow only trusted domains in cors
app.use(cors({
    origin: frontend, // your frontend URL
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(sanitizeV5({ replaceWith: '_' }));

// MongoDB connection
mongoose.connect(dbUrl)//from .env file
    .then(() => console.log(`MongoDB connected`))
    .catch((err) => console.log(err));


//Session
const store = MongoStore.create({
    mongoUrl: dbUrl,//in production that should be your mongoAtlas Url from .env file
    touchAfter: 24 * 60 * 60,//After a particular period of time session will be updated every time user refreshes a page we can limit the period of time if the data has been changed if not then don't save continuously
    crypto: {
        secret: secret
    }
});

//If there is any error this will run
store.on("error", function (e) {
    console.log("Session store error:", e);
})

//Adding on session
const sessionConfig = {
    store,//defines where the session data will be stored 
    secret: secret,//should be taken from .env file
    resave: false,
    sameSite: 'none',
    saveUninitialized: true,
    cookie: {
        secure: true,             // Must be true on HTTPS (Render)
        sameSite: "none",         // Cross-origin cookies require this
        //You can add on the default name for the session on the web so that other person or hacker won't use it for their benefit
        name: 'default',
        //This ensure that our cookies are only accessible through http not through javascripts and all
        httpOnly: true,
        //while deplying its necessary till that it isn't
        //secure:true, this will add on the security hence out data will only be accessible through https and will break our code as our local host is not secured and we will not be able to login 
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))

app.use(passport.initialize());//Intialize the passport
app.use(passport.session());//for persistent login session

//this will activate all 11 of the middlewares of helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'", frontend, "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "connect-src": ["'self'", frontend],
        "default-src": ["'self'", frontend],
        "form-action": ["'self'", frontend],
        "frame-ancestors": ["'self'"]
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);



passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser())//How do we store data in the session
passport.deserializeUser(User.deserializeUser())//How do we get user out of the session


// Routes
app.get("/", (req, res) => {
    //For home page with nothing
    res.json("SmartAssess")
})
app.use("/", users)
app.use("/test", test)
app.use("/result", result)

//For the pages that don't exist
//if we pass something in next it knows that it is an error
app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError("Page not found", 404));
})

//Error Handling
app.use((err, req, res, next) => {
    const { status = 500 } = err;
    //Other then that you can pass err directly 
    if (!err.message) {
        err.message = "Something Went Wrong!!!"
    }
    res.status(status).json({
        type: "error",
        status,
        message: err.message,
        // stack is optional: include only in development
        // stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
