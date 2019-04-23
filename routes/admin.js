const express = require('express');

const adminCont = require('../controllers/adminCont');

const router = express.Router();

// GET /admin/add-product
router.get('/add-product', adminCont.getAddProduct);

router.get('/products', adminCont.getProducts);

router.post('/add-product', adminCont.postAddProduct);

exports.routes = router;
