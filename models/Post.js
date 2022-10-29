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
  post_media: [
    {
      file_format: String,
      file_name: String,
    },
  ],
})

PostSchema.plugin(mongoosastic)

module.exports = mongoose.model("Post", PostSchema)
