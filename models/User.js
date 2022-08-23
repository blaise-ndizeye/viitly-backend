const mongoose = require("mongoose")
const mongoosastic = require("mongoosastic")
const Schema = mongoose.Schema

const UserSchema = new Schema({
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
  email: {
    type: String,
    required: true,
    es_indexed: true,
  },
  phone: {
    type: String,
    required: true,
    es_indexed: true,
  },
  whatsapp: {
    type: String,
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
  nReviews: {
    type: Number,
    required: true,
    default: 0,
  },
  role: {
    type: String,
    default: "PERSONAL",
    enum: ["PERSONAL", "BUSINESS", "PROFFESSIONAL"],
  },
  verified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

UserSchema.plugin(mongoosastic)

module.exports = mongoose.model("User", UserSchema)
