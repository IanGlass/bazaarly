const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');
const { validationResult } = require('express-validator/check')

sgMail.setApiKey(process.env.SG_API_KEY);

const User = require('../models/User');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    pageTitle: 'Login',
    successMessage: req.flash('success'),
    errorMessage: req.flash('error'),
    oldInput: {
      email: null,
      password: null,
    }
  });
}

// Fetch the user and add the user to the session
exports.postLogin = (req, res, next) => {
  // Catch user input errors
  if (!validationResult(req).isEmpty()) {
    return res.status(422).render('auth/login', {
      pageTitle: 'Login',
      successMessage: req.flash('success'),
      errorMessage: validationResult(req).errors,
      oldInput: {
        email: req.body.email,
        password: req.body.password,
      }
    });
  }
  User
    .findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(422).render('auth/login', {
          pageTitle: 'Login',
          successMessage: req.flash('success'),
          errorMessage: [{ msg:'Invalid email or password' }],
          oldInput: {
            email: req.body.email,
            password: req.body.password,
          }
        });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then(matched => {
          if (!matched) {
            return res.status(422).render('auth/login', {
              pageTitle: 'Login',
              successMessage: req.flash('success'),
              errorMessage: [{ msg:'Invalid email or password' }],
              oldInput: {
                email: req.body.email,
                password: req.body.password,
              }
            });
          }
          req.session.user = user;
          req.session.authenticated = true;
          // Can take some ms to save, only redirect once session is saved
          req.session.save((error) => {
            if (error) {console.log(error);}
            return res.redirect('/');
          })
        })
        .catch(error => {
          console.log(error);
          req.flash('error', 'An unknown error occurred');
          res.redirect('/login');
        })
    })
    .catch(error => console.log(error))
}

// Destroying the session containing authentication data effectively logs user out
exports.postLogout = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) { console.log(error); }
    res.redirect('/');
  });
}

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    pageTitle: 'Signup',
    authenticated: false,
    successMessage: req.flash('success'),
    errorMessage: req.flash('error'),
    oldInput: {
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
    },
  });
};

exports.postSignup = (req, res, next) => {
  // Catch user input errors
  if (!validationResult(req).isEmpty()) {
    return res.status(422).render('auth/signup', {
      pageTitle: 'Signup',
      successMessage: req.flash('success'),
      errorMessage: validationResult(req).errors,
      oldInput: {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
      },
    });
  }
  // Check for duplicate email addresses first
  User
    .findOne({ email: req.body.email })
    .then(existingUser => {
      if (existingUser) {
        return res.status(422).render('auth/signup', {
          pageTitle: 'Signup',
          successMessage: req.flash('success'),
          errorMessage: [{ msg: 'E-Mail address already exists'}],
          oldInput: {
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
          },
        });
      }
      bcrypt
        .hash(req.body.password, 12)
        .then(hashedPassword => {
          return User.create({
            email: req.body.email,
            password: hashedPassword,
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
          res.redirect('/login');
        })
    })
    .catch(error => console.log(error))
}

exports.getReset = (req, res, next) => {
  res.render('auth/reset', {
    pageTitle: 'Reset',
    errorMessage: req.flash('error'),
    successMessage: req.flash('success')
  })
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (error, buffer) => {
    if (error) {
      console.log(error);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User
      .findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          return res.status(422).render('auth/reset', {
            pageTitle: 'Signup',
            successMessage: req.flash('success'),
            errorMessage: [{ msg: 'No account with that E-Mail found.'}],
            oldInput: {
              email: req.body.email,
            },
          });
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 60*60*1000;
        user.save()
          .then(result => {
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
      .catch(error => console.log(error))
  });
}

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
    .catch(error => console.log(error))
}

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
    .catch(error => console.log(error))
}