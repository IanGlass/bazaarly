const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

const errorCont = require('./controllers/errorCont');
const sequelize = require('./helpers/database');
const User = require('./models/user');
const Product = require('./models/product');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');


// Tell express to use ejs template engine
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

// Automatically parse any incoming data into res.body
app.use(bodyParser.urlencoded({ extended: false }));

// Statically serve public resources including the css stylesheet
app.use(express.static(path.join(__dirname, 'public/')));

app.use((req, res, next) => {
  User.findByPk(1)
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

// Relate the product model to the user model, show add foreign key but isn't working
User.hasMany(Product);
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

// Instantiate dbs if they don't already exist
sequelize
  // .sync({ force: true })
  .sync()
  .then(() => {
    return User.findByPk(1)
  })
  .catch(error => console.log(error))
  .then((user) => {
    if (!user) {
      return User.create({ name: 'Ian', email: 'test@test.com' });
    }
    return user;
  })
  .then((user) => {
    return user.createCart();
  })
  .then(cart => {
    app.listen(3000);
  })


