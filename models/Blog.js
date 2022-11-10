const mongoose = require("mongoose")
const { Schema } = mongoose

const BlogSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  blog_title: {
    type: String,
    required: true,
  },
  blog_content: {
    type: String,
    required: true,
  },
  blog_media: {
    file_format: String,
    file_name: String,
  },
  prized: {
    type: Boolean,
    default: false,
  },
  nComments: {
    type: Number,
    default: 0,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  tagged_users: [{ type: String }],
})

module.exports = mongoose.model("Blog", BlogSchema)
