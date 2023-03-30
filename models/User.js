const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UserSchema = new Schema(
  {
    avatar: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    user_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: "",
    },
    nFollowers: {
      type: Number,
      required: true,
      default: 0,
    },
    nFollowings: {
      type: Number,
      required: true,
      default: 0,
    },
    nReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    role: {
      type: String,
      default: "PERSONAL",
      enum: ["ADMIN", "PERSONAL", "BUSINESS", "PROFFESSIONAL"],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    verification_code: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("User", UserSchema)
