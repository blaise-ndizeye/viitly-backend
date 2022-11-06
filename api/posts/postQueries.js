const Post = require("../../models/Post")
const { generateServerError } = require("../../helpers/errorHelpers")
const {
  isAdmin,
  isAuthenticated,
  isAccountVerified,
  isPayingUser,
  isValidUser,
} = require("../shield")
const { postData } = require("../../helpers/postHelpers")

const postQueries = {
  async GetAllPosts(_, { user_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isAdmin(ctx.user)

      const allPosts = await Post.find().sort({ _id: -1 })

      return allPosts.map((post) => postData(post))
    } catch (err) {
      generateServerError(err)
    }
  },
}

module.exports = postQueries
