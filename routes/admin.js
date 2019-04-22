const express = require('express');
const router = express.Router();

const productsCont = require('../controllers/productsCont');

// GET /admin/add-product
router.get('/add-product', productsCont.getAddProduct);

router.post('/add-product', productsCont.postAddProduct);

exports.routes = router;
