const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');
const { validationResult } = require('express-validator/check')

sgMail.setApiKey(process.env.SG_API_KEY);

const User = require('../models/user');

/**
 * @description Renders the auth/login view for any user
 * @path GET /login
 */
exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    pageTitle: 'Login',
    successMessage: req.flash('success'),
    errorMessage: req.flash('error'),
    oldInput: req.flash('oldInput')[0],
  });
}

/**
 * @description Submits login information from the GET /login route
 * @path POST /login
 * @param {Object} req.body.email
 * @param {Object} req.body.password
 */
exports.postLogin = (req, res, next) => {
  // Catch user input errors
  if (!validationResult(req).isEmpty()) {
    req.flash('error', validationResult(req).errors);
    req.flash('oldInput', {
      email: req.body.email,
      password: req.body.password,
    });
    return res.status(422).redirect('/login');
  }
  User
    .findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        req.flash('error', { msg:'Invalid email or password' });
        req.flash('oldInput', {
          email: req.body.email,
          password: req.body.password,
        });
        return res.status(422).redirect('/login');
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then(matched => {
          if (!matched) {
            req.flash('error', { msg:'Invalid email or password' });
            req.flash('oldInput', {
              email: req.body.email,
              password: req.body.password,
            });
            return res.status(422).redirect('/login');
          }
          // Add the fetched user to the session for later consumption
          req.session.user = user;
          req.session.authenticated = true;
          req.session.admin = user.admin;
          // Can take some ms to save, only redirect once session is saved
          req.session.save((error) => {
            if (error) {console.log(error);}
            return res.redirect('/');
          })
        })
        .catch(() => {
          req.flash('error', { msg:'An unknown error occurred' });
          req.flash('oldInput', {
            email: req.body.email,
            password: req.body.password,
          });
          return res.status(422).redirect('/login');
        })
    })
    .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
}

/**
 * @description Destroys the user session object, effectively logging them out
 * @path POST /logout
 */
exports.postLogout = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) { console.log(error); }
    res.redirect('/');
  });
}

/**
 * @description Renders the auth/signup view to create a new user
 * @path GET /signup
 */
exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    pageTitle: 'Signup',
    authenticated: false,
    successMessage: req.flash('success'),
    errorMessage: req.flash('error'),
    oldInput: req.flash('oldInput')[0],
  });
};

/**
 * @description Creates a new user from the GET /signup form submission
 * @path POST /signup
 * @param {Object} req.body.email
 * @param {Object} req.body.password
 * @param {Object} req.body.confirmPassword
 * @param {Object} req.body.admin Is the user going to list products to sell or buy. Determines functionality available to user
 */
exports.postSignup = (req, res, next) => {
  // Catch user input errors
  if (!validationResult(req).isEmpty()) {
    req.flash('error', validationResult(req).errors);
    req.flash('oldInput', {
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
    });
    return res.status(422).redirect('/signup');
  }
  // Check for duplicate email addresses first
  User
    .findOne({ email: req.body.email })
    .then(existingUser => {
      if (existingUser) {
        req.flash('error', { msg: 'E-Mail address already exists' });
        req.flash('oldInput', {
          email: req.body.email,
          password: req.body.password,
          confirmPassword: req.body.confirmPassword,
        });
        return res.status(422).redirect('/signup');
      }
      bcrypt
        .hash(req.body.password, 12)
        .then(hashedPassword => {
          return User.create({
            email: req.body.email,
            password: hashedPassword,
            admin: req.body.admin ? true: false,
            cart: {
              items: [],
            }
          })
        })
        .then(() => {
          sgMail.send({
            to: req.body.email,
            from: 'shop@node-complete.com',
            subject: 'Signup Succeeded!',
            text: 'and easy to do anywhere, even with Node.js',
            html: '<h1>You successfully signed up</h1>'
          });
          res.status(201).redirect('/login');
        })
    })
    .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
}

/**
 * @description Renders the auth/reset view to reset a user password
 * @path GET /reset
 */
exports.getReset = (req, res, next) => {
  res.render('auth/reset', {
    pageTitle: 'Reset',
    errorMessage: req.flash('error'),
    successMessage: req.flash('success'),
    oldInput: req.flash('oldInput')[0],
  })
}

/**
 * @description Sends a reset link via email and adds reset token to user in DB if the user exists
 * @path POST /reset
 * @param {Object} res.body.email
 */
exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (error, buffer) => {
    if (error) {
      req.flash('error', { msg: 'Something went wrong' });
      req.flash('oldInput', {
        email: req.body.email,
      });
      return res.status(422).redirect('/reset');
    }
    const token = buffer.toString('hex');
    User
      .findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', { msg: 'No account with that E-Mail found.' });
          req.flash('oldInput', {
            email: req.body.email,
          });
          return res.status(422).redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 60*60*1000;
        user.save()
          .then(() => {
            sgMail.send({
              to: req.body.email,
              from: 'shop@node-complete.com',
              subject: 'Password Reset',
              html: `
                <p>You requested a password reset</p>
                <p>Click this <a href="http://${req.get('host')}/new-password/${token}">link</a> to set a new password</p>
              `
            });
            req.flash('success', 'Password reset link sent, please check your email');
            return res.redirect('/reset');
          })
      })
      .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
  });
}

/**
 * @description Dynamic route that renders the auth/new-password view to set new password view if the reset token is valid
 * @path /GET /new-password/:resetToken
 */
exports.getNewPassword = (req, res, next) => {
  // Only render if valid user for reset token and token not expired
  User
    .findOne({
      resetToken: req.params.resetToken,
      resetTokenExpiration: {
        $gt: Date.now()
      }
    })
    .then((user) => {
      if (!user) {
        return res.redirect('/')
      }
      res.render('auth/new-password', {
        pageTitle: 'New Password',
        userId: user._id.toString(),
        resetToken: req.params.resetToken
      });
    })
    .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
}

/**
 * @description Updates the password for the user by id from the GET /new-password/:resetToken form submission
 * @path POST /new-password
 * @param {Object} req.body.resetToken
 * @param {Object} req.body.password
 */
exports.postNewPassword = (req, res, next) => {
  User
    .findOne({
      resetToken: req.body.resetToken,
      resetTokenExpiration: {
        $gt: Date.now()
      },
      _id: req.body.userId
    })
    .then(user => {
      bcrypt
        .hash(req.body.password, 12)
        .then(hashedPassword => {
          user.password = hashedPassword;
          user.resetToken = null;
          user.resetTokenExpiration = undefined;
          return user.save();
        })
        .then(() => {
          req.flash('success', 'Password successfully changed');
          res.redirect('/login');
        })
    })
    .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
}