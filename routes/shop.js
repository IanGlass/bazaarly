const express = require('express');

const shopCont = require('../controllers/shopController');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopCont.getIndex);

router.get('/products', shopCont.getProducts);

router.get('/cart', isAuth, shopCont.getCart);

// Add a product to the cart
router.post('/cart', isAuth, shopCont.postCart);

router.post('/cart-delete-item', isAuth, shopCont.postCartDeleteProduct);

router.get('/checkout', isAuth, shopCont.getCheckout);

router.get('/orders', isAuth, shopCont.getOrders);

router.get('/invoice/:orderId', isAuth, shopCont.getInvoice);

// Express will now ignore productId but this middleware will get hit if it does not hit anything before
router.get('/products/:productId', shopCont.getProduct);

// Export the router for app.js
module.exports = router;
