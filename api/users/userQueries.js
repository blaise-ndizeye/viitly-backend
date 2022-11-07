const User = require("../../models/User")
const ReportedProblems = require("../../models/ReportedProblems")
const ReportedContent = require("../../models/ReportedContent")
const Prize = require("../../models/Prize")
const ArchivedAccount = require("../../models/ArchivedAccount")
const { generateServerError } = require("../../helpers/errorHelpers")
const {
  isAdmin,
  isAuthenticated,
  isAccountVerified,
  isPayingUser,
  isValidUser,
} = require("../shield")
const {
  userData,
  generateAccessToken,
  archivedAccountData,
} = require("../../helpers/userHelpers")
const {
  problemData,
  reportedContentData,
} = require("../../helpers/problemHelpers")
const { prizeData } = require("../../helpers/productHelpers")

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
  async GetUserData(_, { user_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      const user = await User.findOne({ _id: user_id })

      return userData(user)
    } catch (err) {
      generateServerError(err)
    }
  },
  async GetNewAccessToken(_, { user_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      const user = await User.findOne({ _id: user_id })
      const newAccessToken = await generateAccessToken(user)

      return newAccessToken
    } catch (err) {
      generateServerError(err)
    }
  },
  async GetAllReportedProblems(_, { user_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isAdmin(ctx.user)

      const allProblems = await ReportedProblems.find().sort({ _id: -1 })

      return allProblems.map((problem) => problemData(problem))
    } catch (err) {
      generateServerError(err)
    }
  },
  async GetAllReportedContents(_, { user_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isAdmin(ctx.user)

      const allReportedContents = await ReportedContent.find().sort({ _id: -1 })

      return allReportedContents.map((content) => reportedContentData(content))
    } catch (err) {
      generateServerError(err)
    }
  },
  async GetAllArchivedAccounts(_, { user_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isAdmin(ctx.user)

      const allArchivedAccounts = await ArchivedAccount.find().sort({ _id: -1 })

      return allArchivedAccounts.map((account) => archivedAccountData(account))
    } catch (err) {
      generateServerError(err)
    }
  },
  async GetAllPendingPrizes(_, { user_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isAdmin(ctx.user)

      const allPrizes = await Prize.find({ prized: false }).sort({ _id: 1 })

      return allPrizes.map((prize) => prizeData(prize))
    } catch (err) {
      generateServerError(err)
    }
  },
}

module.exports = userQueries
