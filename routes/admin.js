const express = require('express');
const { body } = require('express-validator/check');

const adminCont = require('../controllers/adminCont');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /admin/add-product
router.get('/add-product', isAuth, adminCont.getAddProduct);

router.get('/products', isAuth, adminCont.getProducts);

router.post('/add-product', isAuth,
body('title')
  .isAlphanumeric()
  .isLength({ min: 3 })
  .trim(),
body('imageUrl')
  .isURL(),
body('price')
  .isFloat()
  .isLength({ min: 3 })
  .trim(),
body('description')
  .isLength({ min: 10 })
  .trim(),
adminCont.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminCont.getEditProduct);

// Product id to edit is enclosed in the request body
router.post('/edit-product', isAuth,
body('title')
  .isAlphanumeric()
  .isLength({ min: 3 })
  .trim(),
body('imageUrl')
  .isURL(),
body('price')
  .isFloat()
  .isLength({ min: 3 })
  .trim(),
body('description')
  .isLength({ min: 10 })
  .trim(),
adminCont.postEditProduct);

router.post('/delete-product', isAuth, adminCont.postDeleteProduct);

exports.routes = router;
