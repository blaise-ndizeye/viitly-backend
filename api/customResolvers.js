const Blog = require("../models/Blog")
const Post = require("../models/Post")
const Product = require("../models/Product")
const Review = require("../models/Reviews")
const User = require("../models/User")
const Comment = require("../models/Comment")
const Following = require("../models/Following")
const UploadScope = require("../models/UploadScope")
const { userData } = require("../helpers/userHelpers")
const { reviewData } = require("../helpers/reviewHelpers")
const { blogData } = require("../helpers/blogHelpers")
const { postData } = require("../helpers/postHelpers")
const { productData } = require("../helpers/productHelpers")
const {
  commentData,
  getCommentDestination,
  replyData,
} = require("../helpers/commentHelpers")
const { followData } = require("../helpers/followHelpers")

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
    async products(parent) {
      const productList = await Product.find({ user_id: parent.user_id })
      return productList.map((product) => productData(product))
    },
    async followers(parent) {
      const followersList = await Following.find({
        $or: [
          { user_id: parent.user_id },
          { $and: [{ follower_id: parent.user_id }, { accepted: true }] },
        ],
      })
      return followersList.map((follower) => followData(follower))
    },
    async followings(parent) {
      const followingsList = await Following.find({
        $and: [{ follower_id: parent.user_id }, { accepted: false }],
      })
      return followingsList.map((followinger) => followData(followinger))
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
    async comments(parent) {
      const commentList = await Comment.find({ to: parent.post_id })
      return commentList.map((comment) => commentData(comment))
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
    async comments(parent) {
      const commentList = await Comment.find({ to: parent.blog_id })
      return commentList.map((comment) => commentData(comment))
    },
  },
  Product: {
    async owner(parent) {
      const user = await User.findById(parent.owner)
      return userData(user)
    },
    async comments(parent) {
      const commentList = await Comment.find({ to: parent.product_id })
      return commentList.map((comment) => commentData(comment))
    },
  },
  CommentSource: {
    __resolveType(obj, _, __) {
      if (obj.blog_id) {
        return "Blog"
      }
      if (obj.post_id) {
        return "Post"
      }
      if (obj.product_id) {
        return "Product"
      }
      if (obj.comment_id) {
        return "Comment"
      }
    },
  },
  CommentResponseObject: {
    __resolveType(obj, _, __) {
      if (obj.comment_id) {
        return "Comment"
      }
      if (obj.reply_id) {
        return "Reply"
      }
    },
  },
  Comment: {
    async from(parent) {
      const user = await User.findById(parent.from)
      return userData(user)
    },
    async to({ to }) {
      const { commentDestName, commentDestObj } = await getCommentDestination(
        to
      )

      if (commentDestName === "Blog") {
        return blogData(commentDestObj)
      }

      if (commentDestName === "Product") {
        return productData(commentDestObj)
      }

      if (commentDestName === "Post") {
        return postData(commentDestObj)
      }

      if (commentDestName === "Comment") {
        return replyData(commentDestObj)
      }
    },
    async replies(parent) {
      const replyList = await Comment.find({ to: parent.comment_id })
      return replyList.map((reply) => replyData(reply))
    },
  },
  Reply: {
    async from(parent) {
      const user = await User.findById(parent.from)
      return userData(user)
    },
  },
  Follower: {
    async follower(parent) {
      const user = await User.findById(parent.follower)
      return userData(user)
    },
    async user(parent) {
      const user = await User.findById(parent.user)
      return userData(user)
    },
  },
}

module.exports = customResolvers
