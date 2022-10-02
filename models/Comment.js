const mongoose = require("mongoose")
const { Schema } = mongoose

const commentSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  nLikes: {
    type: Number,
    default: 0,
  },
  nReplies: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Comment", commentSchema)
