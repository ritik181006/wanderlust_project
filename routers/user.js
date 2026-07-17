const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');

const usersController = require("../controllers/users.js");

router.route("/signup")
    //Signup form
    .get(usersController.renderSignupForm)
    //Signup
    .post(wrapAsync(usersController.signup));

router.route("/login")
    //Login form
    .get(usersController.renderLoginForm)
    //Login
    .post(saveRedirectUrl,
        passport.authenticate('local', { failureRedirect: "/login", failureFlash: true }),
        usersController.login);

//Logout
router.get("/logout", usersController.logout);

module.exports = router;