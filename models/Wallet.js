const mongoose = require("mongoose")
const { Schema } = mongoose

const walletSchema = new Schema({
  price: {
    type: Number,
    required: true,
  },
  blogs_to_offer: {
    type: Number,
    default: 0,
  },
  posts_to_offer: {
    type: Number,
    default: 0,
  },
  products_to_offer: {
    type: Number,
    default: 0,
  },
  currency: {
    type: "String",
    default: "RWF",
  },
  scope: {
    type: String,
    required: true,
    enum: ["ALL", "BUSINESS", "PROFFESSIONAL", "PERSONAL"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Wallet", walletSchema)
