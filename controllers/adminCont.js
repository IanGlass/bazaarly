const Product = require('../models/Product')

exports.getAddProduct = (req, res, next) => {
    // Pass in the path which determines which header is currently active in main-layout.pug
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: req.originalUrl,
        editMode: false
    });
}

exports.postAddProduct = (req, res, next) => {
    const product = new Product(null, req.body.title, req.body.imageUrl, req.body.description, req.body.price);
    product.save();
    // products.push({title: req.body.title, docTitle: 'Shop'});
    res.redirect('/');
}

// add-product and edit-product share the same view
exports.getEditProduct = (req, res, next) => {

    const prodID = req.params.productID;

    Product.getByID(prodID, product => {
        if (!product) {
            return res.redirect('/');
        }

        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: req.originalUrl,
            editMode: true,
            product: product
        });
    });
}

exports.postEditProduct = (req, res, next) => {
    const updatedProduct = new Product(req.body.productID, req.body.title, req.body.imageUrl, req.body.description, req.body.price);

    updatedProduct.save();

    res.redirect('/admin/products');

}

exports.postDeleteProduct = (req, res, next) => {
    Product.deleteByID(req.body.productID, () => {
        res.redirect('/admin/products')
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

