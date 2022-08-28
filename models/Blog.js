const mongoose = require("mongoose")
const mongoosastic = require("mongoosastic")
const { Schema } = mongoose

const BlogSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  blog_title: {
    type: String,
    es_indexed: true,
  },
  blog_content: {
    type: String,
    es_indexed: true,
  },
  blog_media: {
    file_format: String,
    file_name: String,
  },
  prized: {
    type: Boolean,
    default: false,
  },
  nLikes: {
    type: Number,
    default: 0,
  },
  nComments: {
    type: Number,
    default: 0,
  },
  nShares: {
    type: Number,
    default: 0,
  },
  nViews: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  tagged_users: [{ type: String }],
})

BlogSchema.plugin(mongoosastic)

module.exports = mongoose.model("Blog", BlogSchema)
