const express = require('express');
const { body } = require('express-validator/check');

const authCont = require(`${__dirname}/../controllers/authCont`);

const router = express.Router();

router.get('/login', authCont.getLogin);

router.post('/login',
body('email')
  .isEmail()
  .withMessage('Please enter a valid email')
  .normalizeEmail(),
body('password')
  .trim(),
authCont.postLogin);

router.post('/logout', authCont.postLogout);

router.get('/signup', authCont.getSignup);

router.post('/signup',
body('email')
  .isEmail()
  .withMessage('Please enter a valid email'),
body('password')
  .isLength({ min: 8 })
  .withMessage('Password is too short < 8 characters')
  .isAlphanumeric()
  .withMessage('Password cannot contain special characters')
  .trim(),
body('confirmPassword')
  .custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords must match');
    }
    return true;
  })
  .trim(),
authCont.postSignup);

router.get('/reset', authCont.getReset);

router.post('/reset', authCont.postReset);

router.get('/new-password/:resetToken', authCont.getNewPassword);

router.post('/new-password', authCont.postNewPassword);

module.exports = router;