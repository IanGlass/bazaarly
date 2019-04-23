const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        // Pass in the path which determines which header is currently active in main-layout.pug
        res.render('shop/products', {
            pageTitle: 'Shop', 
            path: req.originalUrl,
            prods: products
        });
    });
}

exports.getIndex = (req, res, next) => {
    Product.fetchAll((products) => {
        // Pass in the path which determines which header is currently active in main-layout.pug
        res.render('shop/index', {
        pageTitle: 'Shop', 
        path: req.originalUrl,
        prods: products
      });
    });
};

exports.getCart = (req, res, next) => {
    res.render('shop/cart', {
        pageTitle: 'Cart', 
        path: req.originalUrl
    })
}

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: 'Cart', 
        path: req.originalUrl
    })
}

exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        pageTitle: 'your Orders', 
        path: req.originalUrl
    })
}