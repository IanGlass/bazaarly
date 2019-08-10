const { validationResult } = require('express-validator/check');
const { deleteFile } = require('../helpers/file');

const Product = require('../models/product');

/**
 * @description Renders admin/products view containting the list of products for the admin user
 * @path GET /admin/products
 */
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

/**
 * @description Renders admin/edit-product view to add a new product
 * @path GET /admin/add-product
 */
exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    successMessage: req.flash('success'),
    errorMessage: req.flash('error'),
    product: req.flash('product')[0],
  });
}

/**
 * @description Inserts a new product from the GET / route
 * @path POST /admin/add-product
 */
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

/**
 * @description Renders the admin/edit-product view for the admin user
 * @path GET /admin/edit-product/:productId
 */
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

/**
 * @description Updates the edited product from GET /admin/edit-product/:productId
 * @path POST GET /admin/edit-product
 * @param {Object} req.body.productId The id of the product to update
 * @param {Object} req.body.title
 * @param {Object} req.body.imageUrl
 * @param {Object} req.body.price
 * @param {Object} req.body.description
 */
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

  /**
   * @description Deletes a product by Id for the admin user
   * @path DELETE /admin/product/:productId
   */
exports.deleteProduct = (req, res, next) => {
  Product
    .findById(req.params.productId)
    .then((product) => {
      deleteFile(product.imageUrl);
    })
    .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
  Product
    .deleteOne({ _id: req.params.productId, user: req.session.user._id })
    .then(() => {
      res.json({ success: true });
    })
    .catch(error => {
      res.status(500).json({ success: false });
    })
}

