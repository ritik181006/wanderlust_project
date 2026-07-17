if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const {MongoStore} = require('connect-mongo');
const flash = require("connect-flash");
const User = require('./models/user.js');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const listingRouter = require('./routers/listings.js');
const reviewRouter = require('./routers/reviews.js');
const userRouter = require('./routers/user.js');

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const dbUrl = process.env.ATLASDB_URL;

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret: process.env.SECRET
    },
    touchAfter: 24*3600
});

const sessionOptions = {
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized:true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
main().then(res => { console.log("connected to db"); }).catch(Err => { console.log("some problem in db"); });
async function main() {
    await mongoose.connect(dbUrl);
}

// app.get("/", (Req, res) => {
//     res.send("working");
// });

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use("/listing",listingRouter);
app.use("/listing/:id/reviews",reviewRouter);
app.use("/",userRouter);

// app.get("/test",async (req,res)=>{
//         let sampleListing= new Listing({
//             title:"My New Villa",
//             description:"By the Beach",
//             price:1800,
//             location:"Puri",
//             country:"India"
//         });
//         await sampleListing.save();
// });

// app.get("/demoUser", async(req,res)=>{
//     let fakeUser = new User({
//         email:"rtk@gmail.com",
//         username:"rtk"
//     });
//     const registeredUser = await User.register(fakeUser,"hellowWorld");
//     res.send(registeredUser);
// });

app.listen(8080, () => {
    console.log("app is listening on 8080 port");
});

app.all("/{*splat}", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { err });
    // res.status(statusCode).send(message);
});