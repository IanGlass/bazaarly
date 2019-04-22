const express = require('express');
const path = require('path');
const router = express.Router();

const rootDir = require('../helpers/path');

const products = [];

router.get('/add-product', (req, res, next) => {
  // Pass in the path which determines which header is currently active in main-layout.pug
  res.render('add-product', {pageTitle: 'Add Product', path: req.path});
});

router.post('/add-product', (req, res, next) => {
  console.log(req.body);
  products.push({title: req.body.title, docTitle: 'Shop'});
  res.redirect('/');
});

exports.routes = router;
exports.products = products;
