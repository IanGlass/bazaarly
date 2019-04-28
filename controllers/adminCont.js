const Product = require('../models/Product')

exports.getAddProduct = (req, res, next) => {
    // Pass in the path which determines which header is currently active in main-layout.pug
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: req.originalUrl
    });
}

exports.postAddProduct = (req, res, next) => {
    const product = new Product(req.body.title, req.body.imageUrl, req.body.description, req.body.price);
    product.save();
    // products.push({title: req.body.title, docTitle: 'Shop'});
    res.redirect('/');
}

// add-product and edit-product share the same view
exports.getEditProduct = (req, res, next) => {

    res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: req.originalUrl,
        editing: true
    });
}

exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        // Pass in the path which determines which header is currently active in main-layout.pug
        res.render('admin/products', {
            pageTitle: 'Admin Products', 
            path: req.originalUrl,
            prods: products
        });
    });
}

