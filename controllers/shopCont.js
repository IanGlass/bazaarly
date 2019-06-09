const Product = require('../models/Product')
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
      // Pass in the path which determines which header is currently active in main-layout.pug
      res.render('shop/products', {
        pageTitle: 'Shop',
        path: req.originalUrl,
        prods: products
      });
    })
    .catch(error => console.log(error))
}

exports.getProduct = (req, res, next) => {
  Product.findByPk(req.params.productId)
    .then(product => {
      res.render('shop/product-details', {
        pageTitle: 'Product Details',
        path: req.originalUrl,
        product: product
      });
    })
    .catch(error => console.log(error))
}

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then(products => {
      // Pass in the path which determines which header is currently active
      res.render('shop/index', {
        pageTitle: 'Shop',
        path: req.originalUrl,
        prods: products
      });
    })
    .catch(error => console.log(error))
};

exports.getCart = (req, res, next) => {
  req.user.getCart()
  .then(cart => {
    return cart
      .getProducts()
      .then(products => {
        res.render('shop/cart', {
          pageTitle: 'Your Cart',
          path: req.originalUrl,
          cartProducts: products
        });
      })
      .catch(error => console.log(error))
  })
  .catch(error => console.log(error))
}

exports.postCart = (req, res, next) => {
  let fetchedCart;
  // Fetch the user's cart
  req.user.getCart()
  .then(cart => {
    fetchedCart = cart;
    // Get all the products in the user's cart which matches the product id
    return cart.getProducts({ 
      where: { 
        id: req.body.productId 
      }
    });
  })
  // Increment the cart item quantity or add a new item to the cart
  .then(products => {
    // We have a cart and found an existing product, increment the quantity
    if (products.length && products[0]) {
      return fetchedCart.addProduct(products[0].id, {
        through: {
          quantity: products[0].cartItem.quantity + 1
        }
      })
    }

    // We are adding a new product to the cart
    return Product.findByPk(req.body.productId)
      .then(product => {
        return fetchedCart.addProduct(product.id, {
          through: { 
            quantity: 1 
          } 
        });
      })
  })
  .then(res.redirect('/cart'))
  .catch(error => console.log(error))
}

exports.postCartDeleteProduct = (req, res, next) => {
  req.user.getCart()
  .then(cart => {
    return cart.getProducts({
      where: {
        id: req.body.productId
      }
    })
  })
  .then(products => {
    // Remove all quantity of the product from the cart items 
    return products[0].cartItem.destroy()
  })
  .then(res.redirect('/cart'))
  .catch(error => console.log(error))
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
  });
}