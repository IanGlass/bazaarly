const express = require('express');
const path = require('path');

const rootDir = require('../helpers/path');
const adminData = require('./admin')

const router = express.Router();

router.get('/', (req, res, next) => {
  const products = adminData.products;
  // Pass in the path which determines which header is currently active in main-layout.pug
  res.render('shop', {
    prods: products, 
    pageTitle: 'Shop', 
    path: req.path });
});

module.exports = router;
