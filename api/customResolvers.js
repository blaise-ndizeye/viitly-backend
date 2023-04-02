const Blog = require("../models/Blog")
const Event = require("../models/Event")
const Post = require("../models/Post")
const Product = require("../models/Product")
const Review = require("../models/Reviews")
const User = require("../models/User")
const Comment = require("../models/Comment")
const Following = require("../models/Following")
const UploadScope = require("../models/UploadScope")
const Message = require("../models/Message")
const Notification = require("../models/Notification")
const Location = require("../models/Location")
const Transaction = require("../models/Transaction")
const ReportedContent = require("../models/ReportedContent")
const { userData, locationData } = require("../helpers/userHelpers")
const { reviewData } = require("../helpers/reviewHelpers")
const { blogData } = require("../helpers/blogHelpers")
const { postData } = require("../helpers/postHelpers")
const { productData } = require("../helpers/productHelpers")
const { messageData } = require("../helpers/messageHelpers")
const { notificationData } = require("../helpers/notificationHelpers")
const {
  commentData,
  getCommentDestination,
  replyData,
} = require("../helpers/commentHelpers")
const { followData } = require("../helpers/followHelpers")
const { reportedContentData } = require("../helpers/problemHelpers")

let retrieveHelpers = {
  async getNLikes(parentId) {
    const likes = await Event.find({
      $and: [{ parent_id: parentId }, { event_type: "LIKE" }],
    }).sort({ _id: -1 })
    return likes.length
  },
  async getNShares(parentId) {
    const shares = await Event.find({
      $and: [{ parent_id: parentId }, { event_type: "SHARE" }],
    }).sort({ _id: -1 })
    return shares.length
  },
  async getNViews(parentId) {
    const views = await Event.find({
      $and: [{ parent_id: parentId }, { event_type: "VIEW" }],
    }).sort({ _id: -1 })
    return views.length
  },
  async getLikers(parentId) {
    const likes = await Event.find({
      $and: [{ parent_id: parentId }, { event_type: "LIKE" }],
    }).sort({ _id: -1 })
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
    }).sort({ _id: -1 })
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
    }).sort({ _id: -1 })
    const whoShares = []
    for (let share of shares) {
      let whom = await User.findOne({ _id: share.user_id })
      whoShares.push(whom)
    }
    return whoShares.map((user) => userData(user))
  },
  async getNotifications(parent) {
    const allNotifications = []

    const user = await User.findOne({ _id: parent.user_id })

    const list1 = await Notification.find({
      $or: [
        { specified_user: parent.user_id },
        { notification_type: "ALL" },
        {
          $and: [
            { specified_user: parent.user_id },
            {
              notification_type: {
                $in: [
                  "REQUEST_CC",
                  "ACCEPT_CC",
                  "FOLLOW",
                  "LIKE",
                  "INVITE",
                  "COMMENT",
                  "SHARE",
                ],
              },
            },
          ],
        },
      ],
    }).sort({ _id: -1 })

    list1.forEach((item) => allNotifications.push(item))

    if (user.role === "PROFFESSIONAL") {
      const list2 = await Notification.find({
        notification_type: "PROFFESSIONAL",
      }).sort({ _id: -1 })

      list2.forEach((item) => allNotifications.push(item))
    }

    if (user.role === "BUSINESS") {
      const list3 = await Notification.find({
        notification_type: "BUSINESS",
      }).sort({ _id: -1 })

      list3.forEach((item) => allNotifications.push(item))
    }

    return allNotifications.filter(
      (notification) => !notification.deleted_for.includes(parent.user_id)
    )
  },
  async getUserData(user_id) {
    const user = await User.findById(user_id)
    return userData(user)
  },
}

const customResolvers = {
  Review: {
    async from(parent) {
      return await retrieveHelpers.getUserData(parent.from)
    },
    async to(parent) {
      return await retrieveHelpers.getUserData(parent.to)
    },
  },
  User: {
    async reviews(parent) {
      const reviews = await Review.find({ to: parent.user_id }).sort({
        _id: -1,
      })
      return reviews.map((review) => reviewData(review))
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
    async location(parent) {
      const userLocation = await Location.findOne({ user_id: parent.user_id })
      return locationData(userLocation)
    },
  },
  Post: {
    async owner(parent) {
      return await retrieveHelpers.getUserData(parent.owner)
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
      return await retrieveHelpers.getUserData(parent.owner)
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
      return await retrieveHelpers.getUserData(parent.owner)
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
  ReferNotificationObject: {
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
      if (obj.user_id) {
        return "User"
      }
      if (obj.reported_content_id) {
        return "ReportedContent"
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
      return await retrieveHelpers.getUserData(parent.from)
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
  Notification: {
    async refer_to(parent) {
      const { commentDestName, commentDestObj } = await getCommentDestination(
        parent.refer_to
      )
      const userFound = await User.findOne({ _id: parent.refer_to })
      const reportedContentFound = await ReportedContent.findOne({
        _id: parent.refer_to,
      })

      switch (commentDestName) {
        case "Blog":
          return blogData(commentDestObj)
        case "Product":
          return productData(commentDestObj)
        case "Post":
          return postData(commentDestObj)
        case "Comment":
          return commentData(commentDestObj)
        default:
          if (userFound) {
            return userData(userFound)
          } else if (reportedContentFound) {
            return reportedContentData(reportedContentFound)
          } else return null
      }
    },
  },
  Reply: {
    async from(parent) {
      return await retrieveHelpers.getUserData(parent.from)
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
      return await retrieveHelpers.getUserData(parent.follower)
    },
    async user(parent) {
      return await retrieveHelpers.getUserData(parent.user)
    },
  },
  Message: {
    async from(parent) {
      return await retrieveHelpers.getUserData(parent.from)
    },
    async to(parent) {
      return await retrieveHelpers.getUserData(parent.to)
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
      return await retrieveHelpers.getUserData(parent.reporter)
    },
  },
  Transaction: {
    async done_by(parent) {
      const transaction = await Transaction.findOne({
        _id: parent.transaction_id,
      })
      return await retrieveHelpers.getUserData(transaction.user_id)
    },
  },
  Prize: {
    async owner(parent) {
      return await retrieveHelpers.getUserData(parent.owner)
    },
  },
  RequestedProduct: {
    async product(parent) {
      const requestedProduct = await Product.findOne({ _id: parent.product })
      return productData(requestedProduct)
    },
    async requested_by(parent) {
      return await retrieveHelpers.getUserData(parent.requested_by)
    },
  },
  ReportedContent: {
    async reported_by(parent) {
      return await retrieveHelpers.getUserData(parent.reported_by)
    },
    async content(parent) {
      const pr1 = Blog.findOne({ _id: parent.content })
      const pr2 = Post.findOne({ _id: parent.content })
      const pr3 = Product.findOne({ _id: parent.content })

      const [isBlog, isPost, isProduct] = await Promise.all([pr1, pr2, pr3])

      if (isBlog) {
        return blogData(isBlog)
      }

      if (isPost) {
        return postData(isPost)
      }

      if (isProduct) {
        return productData(isProduct)
      }
    },
  },
  ArchivedAccount: {
    async account(parent) {
      return await retrieveHelpers.getUserData(parent.account)
    },
  },
}

module.exports = { customResolvers, retrieveHelpers }
