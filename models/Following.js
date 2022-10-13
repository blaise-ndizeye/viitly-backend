const mongoose = require("mongoose")
const { Schema } = mongoose

const followingSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  follower_id: {
    type: String,
    required: true,
  },
  accepted: {
    type: Boolean,
    default: false,
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  acceptedAt: Date,
})

module.exports = mongoose.model("Following", followingSchema)
