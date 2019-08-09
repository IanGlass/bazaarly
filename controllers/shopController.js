const PDFDocument =  require('pdfkit');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_AGE = 2;

exports.getIndex = (req, res, next) => {
  Product
    .find()
    .countDocuments()
    .then(numProducts => {
      const currentPage = req.query.page || 1;
      Product
        .find()
        .skip((currentPage - 1) * ITEMS_PER_AGE)
        .limit(ITEMS_PER_AGE)
        .then(products => {
          res.render('shop/index', {
            pageTitle: 'Shop',
            prods: products,
            pagination: {
              numPages: Math.ceil(numProducts/ITEMS_PER_AGE),
              hasNextPage: (ITEMS_PER_AGE * currentPage) < numProducts,
              hasPreviousPage: currentPage > 1,
              currentPage: parseInt(currentPage),
            },
          });
        })
    })
    .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
};

exports.getProducts = (req, res, next) => {
  Product
    .find()
    .countDocuments()
    .then(numProducts => {
      const currentPage = req.query.page || 1;
      Product
        .find()
        .skip((currentPage - 1) * ITEMS_PER_AGE)
        .limit(ITEMS_PER_AGE)
        .then(products => {
          res.render('shop/products', {
            pageTitle: 'Shop',
            prods: products,
            pagination: {
              numPages: Math.ceil(numProducts/ITEMS_PER_AGE),
              hasNextPage: ITEMS_PER_AGE * currentPage < numProducts,
              hasPreviousPage: currentPage > 1,
              currentPage: parseInt(currentPage),
            },
          });
        })
    })
    .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
}

exports.getProduct = (req, res, next) => {
  Product
    .findById(req.params.productId)
    .then(product => {
      res.render('shop/product-details', {
        pageTitle: 'Product Details',
        product: product,
      });
    })
    .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
}

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.product')
    .execPopulate()
    .then(user => {
      res.render('shop/cart', {
        pageTitle: 'Your Cart',
        cartProducts: user.cart.items,
      });
    })
    .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
}

exports.postCart = (req, res, next) => {
  Product.findById(req.body.productId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(() => {
      res.status(201).redirect('/cart');
    })
  .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
}

exports.postCartDeleteProduct = (req, res, next) => {
  req.user
    .removeFromCart(req.body.productId)
    .then(() => {
      res.redirect('/cart');
    })
  .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
}

exports.getCheckout = (req, res, next) => {
  req.user
    .populate('cart.items.product')
    .execPopulate()
    .then(user => {
      let total = 0;
      user.cart.items.forEach((product) => {
        total += product.quantity * product.product.price;
      })
      res.render('shop/checkout', {
        pageTitle: 'Checkout',
        cartProducts: user.cart.items,
        total: total,
      });
    })
    .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
}

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.product')
    .execPopulate()
    .then(user => {
      let total = 0;
      user.cart.items.forEach(product => {
        total += product.quantity * product.product.price;
      });

      return Order.create({
        user: req.user,
        products: user.cart.items,
        total: total,
      })
    })
    .then((order) => {
      // Send request to Stripe server to make a charge
      return stripe.charges.create({
        amount: order.total * 100,
        currency: 'nzd',
        description: 'Example Charge',
        source: req.body.stripeToken,
        metadata: { order_id: order._id.toString() },
      });
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then(() => {
      res.status(201).redirect('/orders')
    })
    .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
}

exports.getOrders = (req, res, next) => {
  Order.find({ user: req.user })
    .then((orders) => {
      res.render('shop/orders', {
        pageTitle: 'Your Orders',
        orders: orders,
      });
    })
  .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
}

exports.getInvoice = (req, res, next) => {
  // Should the requesting user be able to see the invoice?
  Order.findById({ _id: req.params.orderId })
    .then(order => {
      if (order.user.toString() !== req.session.user._id.toString()) {
        return;
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=invoice-"' + req.params.orderId + '.pdf"');

      const PDF = new PDFDocument();
      // Write the created PDF to response read stream to bypass memory overhead of loading entire file
      PDF.pipe(res);
      PDF.fontSize(26).text('Invoice', {
        underline: true
      });

      PDF.text('------------------');

      let totalPrice = 0;
      order.products.forEach(product => {
        totalPrice += product.product.price
        PDF.fontSize(12).text(`${product.product.title} - ${product.quantity} x $${product.product.price}`);
      })
      PDF.fontSize(20).text(`Total Price: $${totalPrice}`);

      PDF.end();

    })
    .catch(error => {
      error.statusCode = 500;
      return next(error);
    })
}
