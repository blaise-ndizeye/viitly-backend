const mongoose = require("mongoose")
const { Schema } = mongoose

const eventSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  parent_id: {
    type: String,
    required: true,
  },
  event_type: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Event", eventSchema)
