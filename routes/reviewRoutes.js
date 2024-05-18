const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams:true });

// router.param('id', tourController.checkID);

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(authController.restrictTo('user'), reviewController.createReview);

router.get('/my-reviews',reviewController.getMyReview);

  router
  .route('/:id').patch(authController.restrictTo('user', 'admin'),reviewController.updateReview)
  .delete(authController.restrictTo('user', 'admin'),reviewController.deleteReview);


module.exports = router;