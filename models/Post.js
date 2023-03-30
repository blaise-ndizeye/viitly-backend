const mongoose = require("mongoose")
const { Schema } = mongoose

const PostSchema = new Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
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
    tagged_users: [{ type: String }],
    post_media: [
      {
        file_format: String,
        file_name: String,
      },
    ],
  },
  { timestamps: true }
)

module.exports = mongoose.model("Post", PostSchema)
