const express = require('express');

const authCont = require('../controllers/authCont');

const router = express.Router();

router.get('/login', authCont.getLogin);

router.post('/login', authCont.postLogin);

router.post('/logout', authCont.postLogout);

module.exports = router;