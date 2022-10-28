const mongoose = require("mongoose")
const { Schema } = mongoose

const savedProductSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  product_id: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model("Savedproduct", savedProductSchema)
