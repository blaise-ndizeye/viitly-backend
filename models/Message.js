const mongoose = require("mongoose")
const { Schema } = mongoose

const messageSchema = new Schema({
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  forwarded: {
    type: Boolean,
    default: false,
  },
  seen: {
    type: Boolean,
    default: false,
  },
  refer_type: String,
  refer_item: String,
  text: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deleted_for_receiver: {
    type: Boolean,
    default: false,
  },
  deleted_for_sender: {
    type: Boolean,
    default: false,
  },
})

module.exports = mongoose.model("Message", messageSchema)
