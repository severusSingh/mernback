const express = require('express');
const cors = require('cors');
const path = require('path');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
// const bookingController = require('./controllers/bookingController');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser')
const upload = require('express-fileupload')

const app = express();

// serving static files
app.use(express.static(path.join(__dirname, 'public')));

app.enable('trust proxy');


// Stripe webhook, BEFORE body-parser, because stripe needs the body as stream
// app.post(
//   '/webhook-checkout',
//   express.raw({ type: 'application/json' }),
//   bookingController.webhookCheckout
// );

app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use(cookieParser());
app.use(upload());

app.use('/uploads',express.static(path.join(__dirname, 'uploads')));



// 1) MIDDLEWARES

// setting security Headers
app.use(helmet());


// Limit request from same api
const limiter = rateLimiter({
  max:100,
  WindowMs: 60*60*1000,
  message:"Too Many Requests from this IP, please try again in an hour!"
});
app.use('/api',limiter);


// Body parser, reading data from body into req.body
app.use(express.json({limit:'10kb'}));

// Data sanitization against nosql query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// prevent parameter polpulation
app.use(hpp({
  whitelist:['duration','ratingsQuantity', 'ratingsAverage','maxGroupSize','difficulty','price']
}));




app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});



// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;