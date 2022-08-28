const Blog = require("../models/Blog")
const Post = require("../models/Post")
const Review = require("../models/Reviews")
const User = require("../models/User")
const UploadScope = require("../models/UploadScope")
const { userData } = require("../helpers/userHelpers")
const { reviewData } = require("../helpers/reviewHelpers")
const { blogData } = require("../helpers/blogHelpers")
const { postData } = require("../helpers/postHelpers")

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
    async blogs_upload_limit(parent) {
      const userScope = await UploadScope.findOne({ user_id: parent.user_id })
      return userScope?.blogs_available ? userScope.blogs_available : 0
    },
    async posts_upload_limit(parent) {
      const userScope = await UploadScope.findOne({ user_id: parent.user_id })
      return userScope?.posts_available ? userScope.posts_available : 0
    },
    async products_upload_limit(parent) {
      const userScope = await UploadScope.findOne({ user_id: parent.user_id })
      return userScope?.products_available ? userScope.products_available : 0
    },
    async blogs(parent) {
      const blogList = await Blog.find({ user_id: parent.user_id })
      return blogList.map((blog) => blogData(blog))
    },
    async posts(parent) {
      const postList = await Post.find({ user_id: parent.user_id })
      return postList.map((post) => postData(post))
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
