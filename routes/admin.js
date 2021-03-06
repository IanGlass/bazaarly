const express = require('express');
const { body } = require('express-validator/check');

const adminCont = require('../controllers/adminController');
const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/is-admin');

const router = express.Router();

router.get('/products', isAuth, isAdmin, adminCont.getProducts);

router.get('/add-product', isAuth, isAdmin, adminCont.getAddProduct);

router.post('/add-product', isAuth, isAdmin,
body('title')
  .isString()
  .isLength({ min: 3 })
  .trim(),
body('price')
  .isFloat()
  .isLength({ min: 3 })
  .trim(),
body('description')
  .isLength({ min: 5 })
  .trim(),
adminCont.postAddProduct);

router.get('/edit-product/:productId', isAuth, isAdmin, adminCont.getEditProduct);

router.post('/edit-product', isAuth, isAdmin,
body('title')
  .isLength({ min: 3 })
  .trim(),
body('price')
  .isFloat()
  .isLength({ min: 3 })
  .trim(),
body('description')
  .isLength({ min: 5 })
  .trim(),
adminCont.postEditProduct);

router.delete('/product/:productId', isAuth, isAdmin, adminCont.deleteProduct);

exports.routes = router;
