const mongoose = require("mongoose");

const Order = mongoose.Schema({
  ownerID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  products: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      soldQuantity: {
        type: Number,
        required: true,
      },
      buyerID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    },
  ],
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model("order", Order);
