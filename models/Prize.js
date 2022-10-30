const mongoose = require("mongoose")
const { Schema } = mongoose

const prizeSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  prize_event: {
    type: String,
    required: true,
    enum: ["ACCEPT_CC", "BLOG_PRIZE", "POST_PRIZE"],
  },
  prize_amount: {
    type: Number,
    required: true,
  },
  prize_amount_currency: {
    type: String,
    required: true,
    enum: ["FRW", "USD"],
  },
  prized: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Prize", prizeSchema)
