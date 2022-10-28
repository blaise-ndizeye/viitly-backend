const mongoose = require("mongoose")
const { Schema } = mongoose

const ccProductSchema = new Schema({
  product_id: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  coin_code: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("CoinCodeProduct", ccProductSchema)
