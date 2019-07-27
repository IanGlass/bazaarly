const { validationResult } = require('express-validator/check');
const { deleteFile } = require('../helpers/file');

const Product = require('../models/Product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    successMessage: req.flash('success'),
    errorMessage: req.flash('error'),
    product: req.flash('product')[0],
  });
}

exports.postAddProduct = (req, res, next) => {
  if (!req.file) {
    req.flash('error', [{ param: 'imageUrl', msg: 'Invalid image' }]);
    req.flash('product', {
      title: req.body.title,
      price: req.body.price,
      description: req.body.description,
    });
    return res.status(422).redirect('/admin/add-product');
  }
  if (!validationResult(req).isEmpty()) {
    req.flash('error', validationResult(req).errors);
    req.flash('product', {
      title: req.body.title,
      price: req.body.price,
      description: req.body.description,
    });
    return res.status(422).redirect('/admin/add-product');
  }
  const product = new Product({
    title:        req.body.title,
    price:        req.body.price,
    description:  req.body.description,
    imageUrl:     req.file.path,
    user:         req.session.user._id,
  })
  product
    .save()
    .then(() => {
      res.status(201).redirect('/admin/products');
    })
    .catch((error) => {
      error.statusCode = 500;
      return next(error);
    })
}

exports.getProducts = (req, res, next) => {
  Product
    .find({ user: req.session.user._id })
    .then((products) => {
      res.render('admin/products', {
        pageTitle: 'Admin Products',
        prods: products,
      });
    })
    .catch(error => console.log(error))
}

// add-product and edit-product share the same view
exports.getEditProduct = (req, res, next) => {
  Product
    .findById(req.params.productId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        successMessage: req.flash('success'),
        errorMessage: req.flash('error'),
        product: req.flash('product')[0] || product,
      });
    })
    .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
}

exports.postEditProduct = (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    req.flash('error', validationResult(req).errors);
    req.flash('product', {
      title: req.body.title,
      imageUrl: req.body.imageUrl,
      price: req.body.price,
      description: req.body.description,
    });
    return res.status(422).redirect(`/admin/edit-product/${req.body.productId}`);
  }
  Product
    .findOne({ _id: req.body.productId, user: req.session.user._id })
    .then(product => {
      // Remove old image file
      if (req.file) {
        console.log
        deleteFile(product.imageUrl);
      }
      // Add the new value of body to the fetched product
      product.title = req.body.title;
      product.price = req.body.price;
      // Only update imageUrl if a path was provided
      product.imageUrl = req.file ? req.file.path : product.imageUrl;
      product.description = req.body.description;
      // Update the old product
      product
        .save()
        .then(() => {
          res.redirect('/admin/products');
        })
    })
    .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
  }

exports.postDeleteProduct = (req, res, next) => {
  Product
    .findById(req.body.productId)
    .then((product) => {
      deleteFile(product.imageUrl);
    })
    .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
  Product
    .deleteOne({ _id: req.body.productId, user: req.session.user._id })
    .then(() => {
      res.redirect('/admin/products')
    })
    .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
}

