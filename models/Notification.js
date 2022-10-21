const mongoose = require("mongoose")
const { Schema } = mongoose

const notificationSchema = new Schema({
  notification_type: {
    type: String,
    required: true,
    enum: [
      "LIKE", // relate with specified_user
      "FOLLOW", //relate with specified_user
      "REQUEST_CC", // relate with specified_user
      "ACCEPT_CC", // relate with specified_user
      "ALL",
      "PROFFESSIONAL",
      "BUSINESS",
    ],
  },
  ref_object: {
    type: "String",
    required: true,
  },
  body: { type: String, default: "" },
  specified_user: { type: String, default: "" },
  seen_by: [{ type: String }],
  deleted_for: [{ type: String }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Notification", notificationSchema)
