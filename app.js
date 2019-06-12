const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');

const User = require('./models/User');
const errorCont = require('./controllers/errorCont');
const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

// Tell express to use ejs template engine
app.set('view engine', 'ejs');
app.set('views', 'views');

// Automatically parse any incoming data into res.body
app.use(bodyParser.urlencoded({ extended: false }));

// Statically serve public resources including the css stylesheet
app.use(express.static(path.join(__dirname, 'public/')));

app.use((req, res, next) => {
  User.findOne({ name: 'visitor' })
    .then(user => {
      req.user = user;
      next();
    })
    .catch(error => console.log(error))
})

app.use('/admin', adminData.routes);
app.use(shopRoutes);

// Catch any path not routed to a middleware and serve a 404 page, THIS INVOCATION OF app.use MUST COME LAST
app.use(errorCont.error404);

// Connected to DB, now spin up server and listen for requests
mongoose.connect('mongodb+srv://shopIt:shopIt@cluster0-pvmln.mongodb.net/shop?retryWrites=true&w=majority', {useNewUrlParser: true})
.then(() => {
  User.findOne()
    .then(user => {
      if (!user) {
        const user = new User({
          name: 'visitor',
          email: 'test@test.com',
          cart: {
            items: []
          }
        })
        user.save()
      }
      app.listen(3000)
    })
})
.catch(error => console.log(error));


