const Blog = require("../models/Blog")
const Event = require("../models/Event")
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
const Message = require("../models/Message")
const { messageData } = require("../helpers/messageHelpers")

let retrieveHelpers = {
  async getNLikes(parentId) {
    const likes = await Event.find({
      $and: [{ parent_id: parentId }, { event_type: "LIKE" }],
    })
    return likes.length
  },
  async getNShares(parentId) {
    const shares = await Event.find({
      $and: [{ parent_id: parentId }, { event_type: "SHARE" }],
    })
    return shares.length
  },
  async getNViews(parentId) {
    const views = await Event.find({
      $and: [{ parent_id: parentId }, { event_type: "VIEW" }],
    })
    return views.length
  },
  async getLikers(parentId) {
    const likes = await Event.find({
      $and: [{ parent_id: parentId }, { event_type: "LIKE" }],
    })
    const likers = []
    for (let like of likes) {
      let liker = await User.findOne({ _id: like.user_id })
      likers.push(liker)
    }
    return likers.map((user) => userData(user))
  },
  async getViewers(parentId) {
    const views = await Event.find({
      $and: [{ parent_id: parentId }, { event_type: "VIEW" }],
    })
    const viewers = []
    for (let view of views) {
      let viewer = await User.findOne({ _id: view.user_id })
      viewers.push(viewer)
    }
    return viewers.map((user) => userData(user))
  },
  async getWhoShares(parentId) {
    const shares = await Event.find({
      $and: [{ parent_id: parentId }, { event_type: "SHARE" }],
    })
    const whoShares = []
    for (let share of shares) {
      let whom = await User.findOne({ _id: share.user_id })
      whoShares.push(whom)
    }
    return whoShares.map((user) => userData(user))
  },
}

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
    async messages(parent) {
      const messagesList = await Message.find({
        $or: [{ to: parent.user_id }, { from: parent.user_id }],
      }).sort({ _id: -1 })

      return messagesList.map((message) => messageData(message))
    },
    async new_messages(parent) {
      const newMessages = await Message.find({
        $and: [
          { to: parent.user_id },
          { seen: false },
          { deleted_for_receiver: false },
        ],
      })
      return newMessages.length
    },
    async nBlogs(parent) {
      const blogList = await Blog.find({ user_id: parent.user_id })
      return blogList.length
    },
    async nPosts(parent) {
      const postList = await Post.find({ user_id: parent.user_id })
      return postList.length
    },
    async nProducts(parent) {
      const productList = await Product.find({ user_id: parent.user_id })
      return productList.length
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
    async nLikes(parent) {
      return await retrieveHelpers.getNLikes(parent.post_id)
    },
    async nShares(parent) {
      return await retrieveHelpers.getNShares(parent.post_id)
    },
    async nViews(parent) {
      return await retrieveHelpers.getNViews(parent.post_id)
    },
    async liked_by(parent) {
      return await retrieveHelpers.getLikers(parent.post_id)
    },
    async viewed_by(parent) {
      return await retrieveHelpers.getViewers(parent.post_id)
    },
    async shared_by(parent) {
      return await retrieveHelpers.getWhoShares(parent.post_id)
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
    async nLikes(parent) {
      return await retrieveHelpers.getNLikes(parent.blog_id)
    },
    async nShares(parent) {
      return await retrieveHelpers.getNShares(parent.blog_id)
    },
    async liked_by(parent) {
      return await retrieveHelpers.getLikers(parent.blog_id)
    },
    async shared_by(parent) {
      return await retrieveHelpers.getWhoShares(parent.blog_id)
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
    async nLikes(parent) {
      return await retrieveHelpers.getNLikes(parent.product_id)
    },
    async nShares(parent) {
      return await retrieveHelpers.getNShares(parent.product_id)
    },
    async nViews(parent) {
      return await retrieveHelpers.getNViews(parent.product_id)
    },
    async liked_by(parent) {
      return await retrieveHelpers.getLikers(parent.product_id)
    },
    async viewed_by(parent) {
      return await retrieveHelpers.getViewers(parent.product_id)
    },
    async shared_by(parent) {
      return await retrieveHelpers.getWhoShares(parent.product_id)
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
    async nLikes(parent) {
      return await retrieveHelpers.getNLikes(parent.comment_id)
    },
    async liked_by(parent) {
      return await retrieveHelpers.getLikers(parent.comment_id)
    },
  },
  Reply: {
    async from(parent) {
      const user = await User.findById(parent.from)
      return userData(user)
    },
    async nLikes(parent) {
      return await retrieveHelpers.getNLikes(parent.reply_id)
    },
    async liked_by(parent) {
      return await retrieveHelpers.getLikers(parent.reply_id)
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
  Message: {
    async from(parent) {
      const user = await User.findById(parent.from)
      return userData(user)
    },
    async to(parent) {
      const user = await User.findById(parent.to)
      return userData(user)
    },
    async refer_item(parent) {
      if (parent.refer_type === "PRODUCT" && parent.refer_item !== "") {
        const product = await Product.findOne({ _id: parent.refer_item })
        return productData(product)
      }
      if (parent.refer_type === "POST" && parent.refer_item !== "") {
        const post = await Post.findOne({ _id: parent.refer_item })
        return postData(post)
      }
      if (parent.refer_type === "BLOG" && parent.refer_item !== "") {
        const blog = await Blog.findOne({ _id: parent.refer_item })
        return blogData(blog)
      }
      //return null
    },
  },
  ReferItem: {
    __resolveType(obj, __, ___) {
      if (obj.product_id) {
        return "Product"
      } else if (obj.post_id) {
        return "Post"
      } else if (obj.blog_id) {
        return "Blog"
      }
    },
  },
  ReportedProblem: {
    async reporter(parent) {
      const user = await User.findById(parent.reporter)
      return userData(user)
    },
  },
}

module.exports = customResolvers
