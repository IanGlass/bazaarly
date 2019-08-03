// Prevents non-seller users from accessing restricted routes
module.exports = (req, res, next) => {
  if (!req.session.admin) {
    return res.status(403).redirect('/');
  }
  next();
}