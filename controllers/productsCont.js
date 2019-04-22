const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    // Pass in the path which determines which header is currently active in main-layout.pug
    res.render('add-product', {pageTitle: 'Add Product', path: req.path});
}

exports.postAddProduct = (req, res, next) => {
    console.log(req.body);
    const product = new Product(req.body.title);
    product.save();
    // products.push({title: req.body.title, docTitle: 'Shop'});
    res.redirect('/');
}

exports.getProducts = (req, res, next) => {
    const products = Product.fetchAll();
    // Pass in the path which determines which header is currently active in main-layout.pug
    res.render('shop', {
      prods: products, 
      pageTitle: 'Shop', 
      path: req.path });
}