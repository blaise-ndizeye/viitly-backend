const mongoose = require("mongoose")
const { Schema } = mongoose

const archivedAccountSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  deleteAt: {
    type: Date,
    required: true,
  },
  archivedAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("ArchivedAccount", archivedAccountSchema)
