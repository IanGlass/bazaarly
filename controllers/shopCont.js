const Product = require('../models/Product');
const Order = require('../models/Order');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      // Pass in the path which determines which header is currently active in main-layout.pug
      res.render('shop/products', {
        pageTitle: 'Shop',
        path: req.originalUrl,
        prods: products,
        authenticated: req.session.authenticated,
      });
    })
    .catch(error => console.log(error))
}

exports.getProduct = (req, res, next) => {
  Product.findById(req.params.productId)
    .then(product => {
      res.render('shop/product-details', {
        pageTitle: 'Product Details',
        path: req.originalUrl,
        product: product,
        authenticated: req.session.authenticated,
      });
    })
    .catch(error => console.log(error))
}

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      // Pass in the path which determines which header is currently active
      res.render('shop/index', {
        pageTitle: 'Shop',
        path: req.originalUrl,
        prods: products,
        authenticated: req.session.authenticated,
      });
    })
    .catch(error => console.log(error))
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.product')
    .execPopulate()
    .then(user => {
      res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: req.originalUrl,
        cartProducts: user.cart.items,
        authenticated: req.session.authenticated,
      });
    })
    .catch(error => console.log(error))
}

exports.postCart = (req, res, next) => {
  Product.findById(req.body.productId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(() => {
      res.redirect('/cart');
    })
  .catch(error => console.log(error))
}

exports.postCartDeleteProduct = (req, res, next) => {
  req.user
    .removeFromCart(req.body.productId)
    .then(() => {
      res.redirect('/cart');
    })
  .catch(error => console.log(error))
}

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.product')
    .execPopulate()
    .then(user => {
      const order = new Order({
        user: req.user,
        products: user.cart.items,
      });
      order.save();
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders')
    })
    .catch(error => console.log(error))
}

exports.getOrders = (req, res, next) => {
  Order.find({ user: req.user })
    .then((orders) => {
      res.render('shop/orders', {
        pageTitle: 'your Orders',
        path: req.originalUrl,
        orders: orders,
        authenticated: req.session.authenticated,
      });
    })
  .catch(error => console.log(error))
}