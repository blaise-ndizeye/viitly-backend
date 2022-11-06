const Blog = require("../../models/Blog")
const { generateServerError } = require("../../helpers/errorHelpers")
const {
  isAdmin,
  isAuthenticated,
  isAccountVerified,
  isPayingUser,
  isValidUser,
} = require("../shield")
const { blogData } = require("../../helpers/blogHelpers")

const blogQueries = {
  async GetAllBlogs(_, { user_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isAdmin(ctx.user)

      let allBlogs = await Blog.find().sort({ _id: -1 })

      return allBlogs.map((blog) => blogData(blog))
    } catch (err) {
      generateServerError(err)
    }
  },
}

module.exports = blogQueries
