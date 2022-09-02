const mongoose = require("mongoose")
const mongoosastic = require("mongoosastic")
const { Schema } = mongoose

const PostSchema = new Schema({
  user_id: {
    type: String,
    required: true,
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
  post_media: [
    {
      file_format: String,
      file_name: String,
    },
  ],
})

PostSchema.plugin(mongoosastic)

module.exports = mongoose.model("Post", PostSchema)
