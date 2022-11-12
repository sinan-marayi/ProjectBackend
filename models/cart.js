const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
  userId: {
    type:String,
    require: true,
  },
  products: [
    {
      productId: mongoose.Types.ObjectId,
      quantity: Number,
    },
  ],
});

const Cart = (module.exports = mongoose.model("carts", cartSchema));
