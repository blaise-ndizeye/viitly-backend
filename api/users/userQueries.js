const User = require("../../models/User")
const Notification = require("../../models/Notification")
const ReportedProblems = require("../../models/ReportedProblems")
const Transaction = require("../../models/Transaction")
const Wallet = require("../../models/Wallet")
const Blog = require("../../models/Blog")
const Product = require("../../models/Product")
const Prize = require("../../models/Prize")
const Message = require("../../models/Message")
const Reviews = require("../../models/Reviews")
const ArchivedAccount = require("../../models/ArchivedAccount")
const { generateServerError } = require("../../helpers/errorHelpers")
const {
  isAdmin,
  isAuthenticated,
  isAccountVerified,
  isPayingUser,
  isValidUser,
} = require("../shield")
const { userData, generateAccessToken } = require("../../helpers/userHelpers")

const userQueries = {
  async GetAllUsers(_, { user_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isAdmin(ctx.user)

      let allUsers = await User.find().sort({ _id: -1 })
      allUsers = allUsers.filter((user) => user._id.toString() !== user_id)

      return allUsers.map((user) => userData(user))
    } catch (err) {
      generateServerError(err)
    }
  },
}

module.exports = userQueries
