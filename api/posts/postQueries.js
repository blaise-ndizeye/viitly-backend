const { ApolloError } = require("apollo-server-errors")

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
  async GetPostData(_, { user_id, post_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      const postExists = await Post.findOne({ _id: post_id })
      if (!postExists) throw new ApolloError("Post not found", 404)

      return postData(postExists)
    } catch (err) {
      generateServerError(err)
    }
  },
}

module.exports = postQueries
