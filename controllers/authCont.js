const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    pageTitle: 'Login',
    path: req.originalUrl,
    authenticated: req.session.authenticated,
  });
}

// Fetch the user and add the user to the session
exports.postLogin = (req, res, next) => {
  User
    .findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.redirect('/login');
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then(matched => {
          if (!matched) {
            return res.redirect('/login');
          }
          req.session.user = user;
          req.session.authenticated = true;
          // Can take time to save, only redirect once session is saved
          req.session.save((error) => {
            if (error) {console.log(error);}
            return res.redirect('/');
          })
        })
        .catch(error => {
          console.log(error);
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
    path: '/signup',
    pageTitle: 'Signup',
    authenticated: false
  });
};

exports.postSignup = (req, res, next) => {
  // Check for duplicate email addresses first
  User
    .findOne({ email: req.body.email })
    .then(existingUser => {
      if (existingUser) {
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
          res.redirect('/');
        })
    })
    .catch(error => console.log(error))
}