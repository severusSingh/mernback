const User = require('./../models/userModel');
const crypto = require('crypto');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const sendEmail = require('../utils/email');

const signToken = id =>{
   return jwt.sign({id}, process.env.JWT_SECRET,{
      expiresIn: process.env.JWT_EXPIRES_IN
   })};

const createSendToken = (user,statusCode,res)=>{
   const token = signToken(user._id);
   const cookieOptions = {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
      httpOnly:true
   }
   if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
   res.cookie('jwt', token, cookieOptions);

   // Remove password from output
   user.password = undefined;

   res.status(statusCode).json({
      Status: "success",
      token,
      data: user
   })
}

exports.signup = catchAsync(async (req,res,next)=>{
 const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt:req.body.passwordChangedAt
 });

 createSendToken(newUser,201,res);
});


exports.login = catchAsync(async(req,res,next)=>{

   const {email,password} = req.body;
   // 1) Check if email and password exist
   if(!email || !password){
     return next(new AppError('Please provide email and password',401));
   };

   // 2)check if user exist and password is correct

   const user = await User.findOne({email}).select('+password');

   if(!user || !(await user.correctPassword(password, user.password))){
      return next(new AppError('Incorrect email or password', 401))
   };
    
   // 3) if everything is okay send token to client
   createSendToken(user,201,res);
});

exports.protect = catchAsync(async(req,res,next)=>{

   // 1) Getting token and check if it's there
   let token;

   if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
      token = req.headers.authorization.split(' ')[1];
   }

   if(!token){
      return next(new AppError('You Not logged in! Please log in to get access.', 401))
   }


   // 2) Verification token

   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
   
   // 3) If user still exists

   const currentUser = await User.findById(decoded.id);
   if(!currentUser){
      return next(new AppError('The user belonging to this token does no logner exists', 401))
   };

   // 4) check if user changed password after the token was issued
   if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password! Please log in again.', 401)
      );
    }

   // 5) Grant access to proctected route

   req.user = currentUser;
   console.log(req.user)
   next();
});


// Only for rendered pages, no errors!
// exports.getProfile = async (req, res, next) => {
//    try {
//      if (req.cookies.jwt) {
//        // 1) verify token
//        const decoded = await promisify(jwt.verify)(
//          req.cookies.jwt,
//          process.env.JWT_SECRET
//        );
 
//        // 2) Check if user still exists
//        const currentUser = await User.findById(decoded.id);
//        if (!currentUser) {
//          return next();
//        }
 
//        // 3) Check if user changed password after the token was issued
//        if (currentUser.changedPasswordAfter(decoded.iat)) {
//          return next();
//        }
 
//        // THERE IS A LOGGED IN USER
//        return res.json(currentUser); // Send response and return to exit the middleware
//      }
//      next(); // If there's no JWT cookie, proceed to the next middleware
//    } catch (err) {
//      next(err); // Pass any errors to the error-handling middleware
//    }
//  };
exports.getProfile = async (req, res, next) => {

   const token= req.cookies.jwt;
   console.log(token)
   if(token){
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
   
      // 3) If user still exists
   
      const currentUser = await User.findById(decoded.id);
      console.log(currentUser);
       return res.json(currentUser)
   }else{
      return res.json(null)
   }};
 


exports.restrictTo = (...roles) => {
   return (req, res, next) => {
     // roles ['admin', 'lead-guide']. role='user'
     if (!roles.includes(req.user.role)) {
       return next(
         new AppError('You do not have permission to perform this action', 403)
       );
     }
 
     next();
   };
 };

exports.forgotpassword = catchAsync(async(req,res,next)=>{
   // 1) Get user based on posted email
   const user = await User.findOne({email:req.body.email});
   if(!user){
      return next(new AppError('There is no user with this email address',401));
   };

   // 2) Generate the random reset password

   const resetToken = user.createPasswordResetToken();
   await user.save({validateBeforeSave : false});

   // 3) send it user's email

   const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;

   const message = `Forgot your password? Submit the Patch request with new password and confimpassword to: ${resetUrl}.\n If not please ignore this meassage`
   try{
      await sendEmail({
         email : user.email,
         subject : 'Your Password reset token (vaild for 10min)',
         message
      })
   
      res.status(200).json({
         status:'success',
         message:'Token send to Email'
      });
   }catch(err){
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save({validateBeforeSave : false});

      return next( new AppError('There was an error sending email. Try again later'),500);

   }
});


exports.resetpassword = catchAsync(async(req,res,next)=>{
   // 1) Get user based on token
   const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
   const user = await User.findOne({passwordResetToken:hashedToken, passwordResetExpires:{$gt: Date.now()}});
   // 2) If token has not expried, and there is user, set the new password
   if(!user){
      return next(new AppError('Token is invalid or expired',400));
   };

   user.password = req.body.password;
   user.passwordConfirm = req.body.passwordConfirm;
   user.passwordResetExpires = undefined;
   user.passwordResetToken = undefined;
   await user.save();

   createSendToken(user,200,res)});


exports.updatePassword = catchAsync(async(req,res,next)=>{
// 1) Get user from collection
   const user = await User.findById(req.user.id).select('+password');

   // 2) Check if posted current password is correct

   if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
    return next(new AppError('Your Current password is worng',401));
   }

   // 3) If so update password

   user.password = req.body.password;
   user.passwordConfirm = req.body.passwordConfirm;
   await user.save();

   createSendToken(user,200,res);
});
