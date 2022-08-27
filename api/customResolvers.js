const User = require("../models/User")
const Review = require("../models/Reviews")
const { userData } = require("../helpers/userHelpers")
const { reviewData } = require("../helpers/reviewHelpers")

const customResolvers = {
  Review: {
    async from(parent) {
      const user = await User.findById(parent.from)
      return userData(user)
    },
    async to(parent) {
      const user = await User.findById(parent.from)
      return userData(user)
    },
  },
  User: {
    async reviews(parent) {
      const reviews = await Review.find({ to: parent.user_id })
      return reviews.map((review) => reviewData(review))
    },
  },
}

module.exports = customResolvers
