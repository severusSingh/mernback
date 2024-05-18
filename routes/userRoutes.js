const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const cors = require('cors');

const router = express.Router();

router.use(cors());
router.post('/signup', authController.signup); 
router.post('/login', authController.login);
router.post('/forgotpassword', authController.forgotpassword); 
router.patch('/resetpassword/:token', authController.resetpassword);



// Protect All Routes after this Middleware
router.get('/loggedIn', authController.getProfile)

router.use(authController.protect)

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getme, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.patch('/deleteMe', userController.deleteMe);
router.patch('/updateAvatar', userController.updateAvatar);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;