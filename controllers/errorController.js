
exports.error404 = (req, res, next) => {
  res.status(404).render('404', {
    pageTitle: `Page "${req.path.replace('/', '')}" Not Found`,
    path: req.path,
  });
}

exports.error500 = (req, res, next) => {
  res.status(500).render('500', {
    pageTitle: `Page Not Found`,
    path: req.path,
  });
}