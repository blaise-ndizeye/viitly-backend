const mongoose = require("mongoose")
const { Schema } = mongoose

const transactionSchema = new Schema({
  service_provider_gen_id: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  amount_paid: {
    type: Number,
    required: true,
  },
  currency_used: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  transaction_role: {
    type: String,
    required: true,
    enum: ["PAYMENT", "PRIZING", "SELL"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Transaction", transactionSchema)
