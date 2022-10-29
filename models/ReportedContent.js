const mongoose = require("mongoose")
const { Schema } = mongoose

const reportedContentSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  content_id: {
    type: String,
    required: true,
  },
  problem: {
    type: String,
    required: true,
  },
  reportedAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("ReportedContent", reportedContentSchema)
