const Tour = require('./../models/tourModel');
const User = require('.././models/userModel');
const catchAsync = require('./../utils/catchAsync');
const Booking = require('../models/bookingModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);
    const user = await User.findById(req.user);

    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/`,
        cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.id}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [{
            price_data: {
                currency: 'usd',
                product_data: {
                    name: `${tour.name} Tour`,
                    description: tour.summary,
                    images: [`https://natours-server-fhts.onrender.com/img/tours/${tour.imageCover}`],
                },
                unit_amount: tour.price * 100, // Price in cents
            },
            quantity: 1
        }],
        mode: 'payment' // Move mode outside of line_items
    });


    const booking = new Booking({
        tour:tour._id,
        user:user._id,
        price:tour.price,
        session:session.id
    });


    await booking.save()


    // 3) Create session as response
    res.status(200).json({
        status: 'success',
        session
    });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
    // 1) Find all bookings for the current user
    const bookings = await Booking.find({ user: req.user.id });

    // 2) Extract the IDs of the tours booked by the user
    const tourIDs = bookings.map(booking => booking.tour);

    // 3) Find tours with the extracted tour IDs
    const tours = await Tour.find({ _id: { $in: tourIDs } });

    // 4) Send the tours as a JSON response
    res.status(200).json({
        status: 'success',
        data: tours
    });
});