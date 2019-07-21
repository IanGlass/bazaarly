const express = require('express');

const authCont = require('../controllers/authCont');

const router = express.Router();

router.get('/login', authCont.getLogin);

router.post('/login', authCont.postLogin);

router.post('/logout', authCont.postLogout);

router.get('/signup', authCont.getSignup);

router.post('/signup', authCont.postSignup);

module.exports = router;