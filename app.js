const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

const errorCont = require('./controllers/errorCont');
const sequelize = require('./helpers/database');

// Tell express to use ejs template engine
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

// Catch any path not routed to a middleware and serve a 404 page, THIS INVOCATION OF app.use MUST COME LAST
app.use(errorCont.error404);

// Instantiate dbs if they don't already exist
sequelize.sync()
    .then(() => {
        app.listen(3000);
    })
    .catch((error) => {
        console.log(error);
    });

