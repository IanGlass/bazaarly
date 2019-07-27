const fs = require('fs');
const path = require('path');

const Product = require('../models/Product');
const Order = require('../models/Order');

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        pageTitle: 'Shop',
        prods: products,
      });
    })
    .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
};

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      // Pass in the path which determines which header is currently active in main-layout.pug
      res.render('shop/products', {
        pageTitle: 'Shop',
        prods: products,
      });
    })
    .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
}

exports.getProduct = (req, res, next) => {
  Product.findById(req.params.productId)
    .then(product => {
      res.render('shop/product-details', {
        pageTitle: 'Product Details',
        product: product,
      });
    })
    .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
}

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.product')
    .execPopulate()
    .then(user => {
      res.render('shop/cart', {
        pageTitle: 'Your Cart',
        cartProducts: user.cart.items,
      });
    })
    .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
}

exports.postCart = (req, res, next) => {
  Product.findById(req.body.productId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(() => {
      res.status(201).redirect('/cart');
    })
  .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
}

exports.postCartDeleteProduct = (req, res, next) => {
  req.user
    .removeFromCart(req.body.productId)
    .then(() => {
      res.redirect('/cart');
    })
  .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
}

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.product')
    .execPopulate()
    .then(user => {
      return Order.create({
        user: req.user,
        products: user.cart.items,
      })
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then(() => {
      res.status(201).redirect('/orders')
    })
    .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
}

exports.getOrders = (req, res, next) => {
  Order.find({ user: req.user })
    .then((orders) => {
      res.render('shop/orders', {
        pageTitle: 'your Orders',
        orders: orders,
      });
    })
  .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
}

exports.getInvoice = (req, res, next) => {
  const invoiceName = 'invoice-' + req.params.invoiceId + '.pdf';
  const invoicePath = path.join('data', 'invoices', invoiceName);
  fs.readFile(invoicePath, (error, data) => {
    if (error) {
      return next(error);
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
    res.send(data);
  })
}