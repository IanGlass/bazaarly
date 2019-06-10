const Product = require('../models/Product')

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
  // Fetch the user's cart and simultaneously fetch all products in the cart through cart-item table
  req.user.getCart({
    include: ['products']
  })
  .then(cart => {
    res.render('shop/cart', {
    pageTitle: 'Your Cart',
    path: req.originalUrl,
    cartProducts: cart.products
  });
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
    Product.findByPk(req.body.productId)
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

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  // Get the user's cart and associated products in the cart
  req.user.getCart()
  .then(cart => {
    fetchedCart = cart;
    return cart.getProducts()
  })
  // Associate a new row in the order table with a user and copy the products to the order-item table
  .then(products => {
    req.user.createOrder()
    .then(order => {
      order.addProducts(products.map(product => {
        // For each product saved to the order table, map the quantity over from the cart-item table
        product.orderItem = {
          quantity: product.cartItem.quantity
        }
        return product;
      }))
    })
  })
  .then(() => {
    // Clear the cart
    fetchedCart.setProducts(null)
    .then(res.redirect('/orders'))
  })
  .catch(error => console.log(error))
}

exports.getOrders = (req, res, next) => {
  // Fetch the user's orders and their associated products through the order-item table
  req.user.getOrders({
    include: ['products']
  })
  .then(orders => {
    res.render('shop/orders', {
      pageTitle: 'your Orders',
      path: req.originalUrl,
      orders: orders
    });
  })
  .catch(error => console.log(error))
}