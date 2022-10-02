const Blog = require("../models/Blog")
const Post = require("../models/Post")
const Product = require("../models/Product")
const Comment = require("../models/Comment")

module.exports = {
  commentData(data) {
    return {
      comment_id: data._id.toString(),
      from: data.user_id,
      to: data.to,
      body: data.body,
      nLikes: data.nLikes,
      nReplies: data.nReplies,
      createdAt: data.createdAt.toISOString(),
    }
  },
  replyData(data) {
    return {
      reply_id: data._id.toString(),
      from: data.user_id,
      to: data.to,
      body: data.body,
      nLikes: data.nLikes,
      createdAt: data.createdAt.toISOString(),
    }
  },
  async getCommentDestination(to) {
    const sentToBlog = Blog.findOne({ _id: to })
    const sentToPost = Post.findOne({ _id: to })
    const sentToProduct = Product.findOne({ _id: to })
    const repliedToComment = Comment.findOne({ _id: to })

    const [pr1, pr2, pr3, pr4] = await Promise.all([
      sentToBlog,
      sentToPost,
      sentToProduct,
      repliedToComment,
    ])
    if (pr1) {
      return {
        commentDestName: "Blog",
        commentDestObj: pr1,
        errorMsg: "",
      }
    } else if (pr2) {
      return {
        commentDestName: "Post",
        commentDestObj: pr2,
        errorMsg: "",
      }
    } else if (pr3) {
      return {
        commentDestName: "Product",
        commentDestObj: pr3,
        errorMsg: "",
      }
    } else if (pr4) {
      return {
        commentDestName: "Comment",
        commentDestObj: pr4,
        errorMsg: "",
      }
    } else {
      return {
        commentDestName: "",
        commentDestObj: null,
        errorMsg: "Comment Destination Object not found",
      }
    }
  },
}
