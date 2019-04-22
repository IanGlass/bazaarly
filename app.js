const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const pug = require('pug');

const app = express();

// Tell express to use pug template engine
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

// Automatically parse any incoming data into res.body
app.use(bodyParser.urlencoded({extended: false}));

// Statically serve public resources including the css stylesheet
app.use(express.static(path.join(__dirname, 'public/')));

app.use('/admin', adminData.routes);
app.use(shopRoutes);

// Catch any path not routed to a middleware and sever a 404 page
app.use((req, res, next) => {
    res.status(404).render('404', {pageTitle: 'Page Not Found'});
})

app.listen(3000);
