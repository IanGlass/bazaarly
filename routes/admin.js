const express = require('express');

const adminCont = require('../controllers/adminCont');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /admin/add-product
router.get('/add-product', isAuth, adminCont.getAddProduct);

router.get('/products', isAuth, adminCont.getProducts);

router.post('/add-product', isAuth, adminCont.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminCont.getEditProduct);

// Product id to edit is enclosed in the request body
router.post('/edit-product', isAuth, adminCont.postEditProduct);
router.post('/delete-product', isAuth, adminCont.postDeleteProduct);

exports.routes = router;
