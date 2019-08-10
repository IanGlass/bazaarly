
/**
 * @description Renders a 404 error page if an invalid route is requested
 * @path /404
 */
exports.error404 = (req, res, next) => {
  res.status(404).render('404', {
    pageTitle: `Page "${req.path.replace('/', '')}" Not Found`,
    path: req.path,
  });
}

/**
 * @description Renders a 500 error page if an internal server error occurred.
 * @path /500
 */
exports.error500 = (req, res, next) => {
  res.status(500).render('500', {
    pageTitle: `Page Not Found`,
    path: req.path,
  });
}