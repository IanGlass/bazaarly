const express = require('express');

const shopCont = require('../controllers/shopCont');

const router = express.Router();

router.get('/', shopCont.getIndex);

router.get('/products', shopCont.getProducts);

router.get('/cart', shopCont.getCart);

router.get('/checkout', shopCont.getCheckout);

router.get('/orders', shopCont.getOrders);


// Export the router for app.js
module.exports = router;
