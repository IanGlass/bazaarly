const Product = require('../models/Product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    editMode: false,
    errorMessage: req.flash('error'),
  });
}

exports.postAddProduct = (req, res, next) => {
  const product = new Product({
    title:        req.body.title,
    price:        req.body.price,
    description:  req.body.description,
    imageUrl:     req.body.imageUrl,
    user:         req.session.user._id,
  })
  product
    .save()
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch((error) => {
      req.flash('error', 'Missing product information');
      res.redirect('/admin/add-product');
      console.log(error);
    })
}

exports.getProducts = (req, res, next) => {
  Product.find({ user: req.session.user._id })
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
  Product.findById(req.params.productId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }

      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
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
      if (product.user !== req.session.user) {
        return res.redirect('/');
      }
      // Add the new value of body to the fetched product
      product.title = req.body.title;
      product.price = req.body.price;
      product.imageUrl = req.body.imageUrl;
      product.description = req.body.description;
      // Update the old product
      product
        .save()
        .then(() => {
          res.redirect('/admin/products');
        })
    })
    .catch(error => console.log(error))
  }

exports.postDeleteProduct = (req, res, next) => {
  Product
    .deleteOne({ _id: req.body.productId, user: req.session.use })
    .then(() => {
      res.redirect('/admin/products')
    })
    .catch(error => console.log(error))
}

