const AppError = require('../utils/AppError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

exports.getAllUsers = catchAsync(async(req, res) => {
  const user = await User.find();
  res.status(200).json({
    status: 'success',
    results: user.length,
    data: {
      user
    }
  });
});

// Filters Out unwanted Flieds name that are not allowed to be updated
const filterObj = (obj, ...allowedFlieds)=>{
  const newObj = {};
  Object.keys(obj).forEach(el=>{
    if(allowedFlieds.includes(el)) newObj[el]= obj[el]
  });
  return newObj;
};

 exports.updateMe = catchAsync( async (req,res,next)=>{
//  1) create error if user posted password data
  if(req.body.password || req.body.passwordConfirm){
    return next(new AppError('This route is not for password update, Please use /updateMyPassword',400))
  };

  // 2) Update user document
  
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {new:true, runValidators:true});

  res.status(200).json({
    status:'success',
    data:{
      user: updatedUser
    }
  })
});

exports.deleteMe = catchAsync(async (req,res,next)=>{
  await User.findByIdAndUpdate(req.user.id, {active:false});

  res.status(204).json({
    status:"success",
    data: null
  })
})


exports.getme = (req,res,next)=>{
  req.params.id = req.user.id;
  next();
}

exports.getUser =  catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  // user.findOne({ _id: req.params.id })

  if (!user) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});


exports.updateAvatar = catchAsync(async (req, res, next) => {
  if (!req.files || !req.files.photo) {
    return next(new AppError("Please choose an image", 422));
  }

  const { photo } = req.files;

  // Find user from database
  const user = await User.findById(req.user.id);

  // Delete old avatar if exists
  if (user.photo) {
    fs.unlink(path.join(__dirname, '..', 'uploads', user.photo), (err) => {
      if (err) return next(new AppError(err));
    });
  }

  if (photo.size > 500000) {
    return next(new AppError('Profile Picture too Big. Should be less than 500kb', 401));
  }

  const uuid = uuidv4(); // Generate unique filename using uuidv4
  const newFilename = `${uuid}.${photo.name.split('.').pop()}`; // Append unique identifier to filename

  photo.mv(path.join(__dirname, '..', 'uploads', newFilename), async (err) => {
    if (err) return next(new AppError(err));

    const updatedPhoto = await User.findByIdAndUpdate(req.user.id, { photo: newFilename }, { new: true });

    if (!updatedPhoto) {
      return next(new AppError("Photo couldn't be Changed", 422));
    }

    res.status(200).json(updatedPhoto);
  });
});

exports.createUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };
  exports.updateUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };
  exports.deleteUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };