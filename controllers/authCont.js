const User = require('../models/User');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    pageTitle: 'Login',
    path: req.originalUrl,
    authenticated: req.session.authenticated,
  });
}

// Fetch the user and add the user to the session
exports.postLogin = (req, res, next) => {
  User.findOne({ name: 'visitor' })
    .then(user => {
      req.session.user = user;
      req.session.authenticated = true;
      // Can take time to save, only redirect once session is saved
      req.session.save((error) => {
        if (error) {console.log(error);}
        res.redirect('/');
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