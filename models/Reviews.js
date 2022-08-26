const mongoose = require("mongoose")
const mongoosastic = require("mongoosastic")
const Schema = mongoose.Schema

const reviewSchema = new Schema({
    rating: {
        type: Number,
        required: true,
        default: 1
    },
    from: {
        type: String,
        required: true,
    },
    to: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        es_indexed: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

reviewSchema.plugin(mongoosastic)

module.exports = mongoose.model("Review", reviewSchema)