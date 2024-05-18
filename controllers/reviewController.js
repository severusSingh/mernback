const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(async(req,res,next)=>{

    let filter = {};
    if(req.params.tourId) filter = {tour : req.params.tourId};
    const reviews = await Review.find(filter);

    res.status(200).json({
        status:"success",
        result:reviews.length,
        data:{
        reviews
        }
})
});


exports.createReview = catchAsync(async(req,res,next)=>{

    // Allow nested routes
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
const newReview = await Review.create(req.body);
res.status(200).json({
    status:"success",
    data:{
        review:newReview
    }
})
});

exports.updateReview = catchAsync(async(req, res, next)=>{
    const updatedReview = await Review.findByIdAndUpdate(req.params.id, req.body,{
        new: true,
        runValidators: true
      });

      if (!updatedReview) {
        return next(new AppError('No Review found with that ID', 404));
      }
    
      res.status(200).json({
        status: 'success',
        data: {
          updatedReview
        }
      });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
    const review = await Review.findByIdAndDelete(req.params.id);
  
    if (!review) {
      return next(new AppError('No review found with that ID', 404));
    }
  
    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  exports.getMyReview = catchAsync(async (req, res, next) => {
    // 1) Find all bookings
    const review = await Review.find({ user: req.user.id });
  
  
    res.status(200).json({
        status:'success',
        data: review
    })
  });