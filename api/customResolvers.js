const Post = require("../models/Post")
const Review = require("../models/Reviews")
const User = require("../models/User")
const { userData } = require("../helpers/userHelpers")
const { reviewData } = require("../helpers/reviewHelpers")

const customResolvers = {
  Review: {
    async from(parent) {
      const user = await User.findById(parent.from)
      return userData(user)
    },
    async to(parent) {
      const user = await User.findById(parent.to)
      return userData(user)
    },
  },
  User: {
    async reviews(parent) {
      const reviews = await Review.find({ to: parent.user_id }).sort({
        _id: -1,
      })
      return reviews.map((review) => reviewData(review))
    },
  },
  Post: {
    async owner(parent) {
      const user = await User.findById(parent.owner)
      return userData(user)
    },
    async tagged_users(parent) {
      const users = await User.find({ _id: { $in: parent.tagged_users } })
      return users.map((user) => userData(user))
    },
  },
  Blog: {
    async owner(parent) {
      const user = await User.findById(parent.owner)
      return userData(user)
    },
    async tagged_users(parent) {
      const users = await User.find({ _id: { $in: parent.tagged_users } })
      return users.map((user) => userData(user))
    },
  },
}

module.exports = customResolvers
