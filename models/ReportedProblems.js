const mongoose = require("mongoose")
const { Schema } = mongoose

const problemSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("ReportedProblems", problemSchema)
