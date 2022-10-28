const mongoose = require("mongoose")
const mongoosastic = require("mongoosastic")
const { Schema } = mongoose

const locationSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  province: {
    type: String,
    required: true,
    es_indexed: true,
  },
  district: {
    type: String,
    required: true,
    es_indexed: true,
  },
  market_description: {
    type: String,
    default: "",
    es_indexed: true,
  },
  latitude: {
    type: String,
    default: "",
  },
  longitude: {
    type: String,
    default: "",
  },
})

locationSchema.plugin(mongoosastic)

module.exports = mongoose.model("Location", locationSchema)
