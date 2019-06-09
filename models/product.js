const Sequelize = require('sequelize');
const sequelize = require('../helpers/database');

const Product = sequelize.define('product', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  price: {
    type: Sequelize.DOUBLE,
    allowNull: false
  },
  imageUrl: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false
  },
  // Associated foreign key for user table, SHOULD NOT NEED TO DEFINE THIS MANUALLY
  userId: {
    type: Sequelize.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  }
});

module.exports = Product;