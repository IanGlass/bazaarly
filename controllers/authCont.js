const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey('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');

const User = require('../models/User');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    pageTitle: 'Login',
    errorMessage: req.flash('error'),
  });
}

// Fetch the user and add the user to the session
exports.postLogin = (req, res, next) => {
  User
    .findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email or password');
        return res.redirect('/login');
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then(matched => {
          if (!matched) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
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
    errorMessage: req.flash('error'),
  });
};

exports.postSignup = (req, res, next) => {
  // Check for duplicate email addresses first
  User
    .findOne({ email: req.body.email })
    .then(existingUser => {
      if (existingUser) {
        req.flash('error', 'E-Mail address already exists');
        return res.redirect('/signup');
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
          res.redirect('/');
        })
    })
    .catch(error => console.log(error))
}

exports.getReset = (req, res, next) => {
  res.render('auth/reset', {
    pageTitle: 'Reset',
    errorMessage: req.flash('error'),
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
          req.flash('error', 'No account with that E-Mail found.')
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 60*60*1000;
        return user.save()
      })
      .then(result => {
        sgMail.send({
          to: req.body.email,
          from: 'shop@node-complete.com',
          subject: 'Signup Succeeded!',
          text: 'and easy to do anywhere, even with Node.js',
          html: '<h1>You successfully signed up</h1>'
        });
      })
      .catch(error => console.log(error))
  });
}