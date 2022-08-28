const mongoose = require("mongoose")
const { Schema } = mongoose

const uploadScopeSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  blogs_available: {
    type: Number,
    default: 0,
  },
  posts_available: {
    type: Number,
    default: 0,
  },
  products_available: {
    type: Number,
    default: 0,
  },
})

module.exports = mongoose.model("UploadScope", uploadScopeSchema)
