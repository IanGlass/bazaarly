const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  admin: {
    type: Boolean,
    required: true,
  },

  resetToken: String,

  resetTokenExpiration: Date,

  cart: {
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
        quantity: {
          type: Number,
          required: true,
        }
      }
    ]
  }
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex(cartProduct => {
    return cartProduct.product.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      product: product._id,
      quantity: newQuantity,
    });
  }
  const updatedCart = {
    items: updatedCartItems
  };
  this.cart = updatedCart;
  return this.save()
}

userSchema.methods.removeFromCart = function(productId) {
  this.cart.items = this.cart.items.filter(item => {
    return item.product.toString() !== productId.toString();
  })
  return this.save();
}

userSchema.methods.clearCart = function() {
  this.cart = { items: [] };
  return this.save();
}

module.exports = mongoose.model('User', userSchema);