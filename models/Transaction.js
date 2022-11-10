const mongoose = require("mongoose")
const mongoosastic = require("mongoosastic")
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
    es_indexed: true,
  },
  currency_used: {
    type: String,
    required: true,
    es_indexed: true,
  },
  description: {
    type: String,
    es_indexed: true,
  },
  transaction_role: {
    type: String,
    required: true,
    es_indexed: true,
    enum: ["PAYMENT", "PRIZING", "SELL"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

transactionSchema.plugin(mongoosastic)

module.exports = mongoose.model("Transaction", transactionSchema)
