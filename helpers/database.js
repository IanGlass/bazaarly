const Sequelize = require('sequelize');

const sequelize = new Sequelize('shop-it', 'shop-it-user', 'shop-it', {
  dialect: 'mysql', host: 'localhost'
});

module.exports = sequelize;