const mongoose = require("mongoose")
const mongoosastic = require("mongoosastic")
const Schema = mongoose.Schema

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      es_indexed: true,
    },
    user_name: {
      type: String,
      required: true,
      es_indexed: true,
    },
    phone: {
      type: Number,
      required: true,
      es_indexed: true,
    },
    whatsapp: {
      type: Number,
      required: true,
      es_indexed: true,
    },
    nFollowers: {
      type: Number,
      required: true,
      default: 0,
    },
    nPosts: {
      type: Number,
      required: true,
      default: 0,
    },
    nProducts: {
      type: Number,
      required: true,
      default: 0,
    },
    role: {
      type: String,
      default: "personal",
    },
  },
  { timestamps: true }
)

UserSchema.plugin(mongoosastic)

module.exports = mongoose.model("User", UserSchema)
