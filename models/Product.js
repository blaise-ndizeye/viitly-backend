const mongoose = require("mongoose")
const mongoosastic = require("mongoosastic")
const { Schema } = mongoose

const productSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    es_indexed: true,
  },
  category: {
    type: String,
    required: true,
    es_indexed: true,
  },
  price: {
    type: Number,
    required: true,
    es_indexed: true,
  },
  price_strategy: {
    type: String,
    required: true,
    es_indexed: true,
    default: "NEGOTIATE",
    enum: ["FIXED", "NEGOTIATE"],
  },
  price_currency: {
    type: String,
    default: "FRW",
    enum: ["FRW", "USD"],
  },
  availability: {
    type: String,
    required: true,
    es_indexed: true,
    default: "SALE",
    enum: ["SALE", "RENT"],
  },
  description: {
    type: String,
    required: true,
    es_indexed: true,
  },
  prized: {
    type: Boolean,
    default: false,
  },
  nComments: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  product_media: [
    {
      file_name: String,
      file_format: String,
    },
  ],
})

productSchema.plugin(mongoosastic)

module.exports = mongoose.model("Product", productSchema)
