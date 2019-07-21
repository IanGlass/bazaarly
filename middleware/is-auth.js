// Prevents uauthorized users from accessing restricted routes
module.exports = (req, res, next) => {
  if (!req.session.authenticated) {
    return res.redirect('/login');
  }
  next();
}