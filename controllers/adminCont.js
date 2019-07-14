const Product = require('../models/Product')

exports.getAddProduct = (req, res, next) => {
  // Pass in the path which determines which header is currently active in main-layout.pug
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: req.originalUrl,
    editMode: false,
    authenticated: req.session.authenticated,
  });
}

exports.postAddProduct = (req, res, next) => {
  const product = new Product({
    title:        req.body.title,
    price:        req.body.price,
    description:  req.body.description,
    imageUrl:     req.body.imageUrl,
    userId:       req.user._id,
  })
  product
    .save()
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch(error => console.log(error))
}

// add-product and edit-product share the same view
exports.getEditProduct = (req, res, next) => {
  Product.findById(req.params.productId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }

      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: req.originalUrl,
        editMode: true,
        product: product
      });
    })
    .catch(error => console.log(error))
}

exports.postEditProduct = (req, res, next) => {
  Product
    .findById(req.body.productId)
    .then(product => {
      // Add the new value of body to the fetched product
      product.title = req.body.title;
      product.price = req.body.price;
      product.imageUrl = req.body.imageUrl;
      product.description = req.body.description;
      // Update the old product
      product.save();
    })
    // Called after product.save()
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch(error => console.log(error))
  }

exports.postDeleteProduct = (req, res, next) => {
  Product
    .findByIdAndRemove(req.body.productId)
    .then(() => {
      res.redirect('/admin/products')
    })
    .catch(error => console.log(error))
}

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render('admin/products', {
        pageTitle: 'Admin Products',
        path: req.originalUrl,
        prods: products,
        authenticated: req.session.authenticated,
      });
    })
    .catch(error => console.log(error))
}

