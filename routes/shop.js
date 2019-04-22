const express = require('express');
const router = express.Router();

const productsCont = require('../controllers/productsCont');

router.get('/', productsCont.getProducts);

// Export the router for app.js
module.exports = router;
