// Prevents uauthorized users from accessing restricted routes
module.exports = (req, res, next) => {
  if (!req.session.authenticated) {
    return res.status(403).redirect('/login');
  }
  next();
}