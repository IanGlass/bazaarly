const express = require('express');

const shopCont = require('../controllers/shopController');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopCont.getIndex);

router.get('/products/:productId', shopCont.getProduct);

router.get('/cart', isAuth, shopCont.getCart);

router.post('/cart', isAuth, shopCont.postCart);

router.post('/cart-delete-item', isAuth, shopCont.postCartDeleteProduct);

router.get('/checkout', isAuth, shopCont.getCheckout);

router.get('/orders', isAuth, shopCont.getOrders);

router.get('/invoice/:orderId', isAuth, shopCont.getInvoice);


// Export the router for app.js
module.exports = router;
