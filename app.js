const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const helmet = require('helmet');
const compression = require('compression');

// Stores secrets in process env variables
require('dotenv').config()

const User = require('./models/user');
const errorCont = require('./controllers/errorController');
const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const isAuth = require('./middleware/is-auth');
const shopCont = require('./controllers/shopController');
const log = require('./logger');

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0-pvmln.mongodb.net/bazaarly?`;

const app = express();

// Expose the app for testing
module.exports = {
  app,
}

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

const csrfProtection = csrf();

// Tell express to use ejs template engine
app.set('view engine', 'ejs');
app.set('views', 'views');

// Automatically parse any incoming data into res.body
app.use(bodyParser.urlencoded({ extended: false }));

app.use(helmet());
app.use(compression());

// Parse file data into the req.file and save to /images if png, jpg or jpeg only
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'data/images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + '-' + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  }
  cb(null, false);
}
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('imageUrl'));

// Statically serve public resources including the css stylesheet and product images
app.use(express.static(path.join(__dirname, 'public')));
app.use('/data/images', express.static(path.join(__dirname, 'data/images')));

// Add session middleware to allow multiple requests from the same connection without re-authentication
app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store: store,
}));

// Add session authentication and request path to all views
app.use((req, res, next) => {
  // Remove query params from URL path
  res.locals.path = req.originalUrl.split('?')[0];
  res.locals.authenticated = req.session.authenticated;
  res.locals.admin = req.session.admin;
  res.locals.__dirname = __dirname;
  next();
})

// Used to res.redirect error messages back to client without persistent storage in session
app.use(flash());

// Fetch the user object using our mongoose user model and session stored user Id so all model methods are available for this request
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
});

// Stripe does not handle CSRF token so need this route before csrfProtection is added
app.post('/create-order', isAuth, shopCont.postOrder);

// Must be initialised after the session, as the session is used
app.use(csrfProtection);

// Add csrf token all views
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
})

// Serve 500 error page
app.get('/500', errorCont.error500);

app.use('/admin', adminData.routes);
app.use(shopRoutes);
app.use(authRoutes);

// Catch any path not routed to a middleware and serve a 404 page, THIS INVOCATION OF app.use MUST COME LAST
app.use(errorCont.error404);

// Catch server errors thrown in application
app.use((error, req, res, next) => {
  log.error(error);
  res.status(error.statusCode).redirect(`/${error.statusCode}`);
})

// Connected to DB, now spin up server and listen for requests
mongoose.connect(MONGODB_URI, {useNewUrlParser: true})
.then(() => {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
})
.catch(error => console.log(error));


