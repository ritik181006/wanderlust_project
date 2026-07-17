const express = require('express');
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require('../models/review.js');
const Listing = require('../models/list.js');
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");

//Create review
router.post("/",isLoggedIn, validateReview,wrapAsync(reviewController.createReview));

//Delete review
router.delete("/:reviewsId",isLoggedIn, isReviewAuthor,reviewController.destroyReview);

module.exports = router;