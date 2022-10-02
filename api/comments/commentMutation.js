const { ApolloError } = require("apollo-server-errors")

const Blog = require("../../models/Blog")
const Comment = require("../../models/Comment")
const Product = require("../../models/Product")
const Post = require("../../models/Post")
const { isAuthenticated, isValidUser } = require("../shield")
const { generateServerError } = require("../../helpers/errorHelpers")
const {
  commentData,
  getCommentDestination,
  replyData,
} = require("../../helpers/commentHelpers")

const commentMutations = {
  async SendComment(_, { inputs }, ctx, ___) {
    try {
      const { user_id, to, body } = inputs

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)

      if (!body) throw new ApolloError("Comment is required", 400)
      if (!to)
        throw new ApolloError("Comment destinationId => [to] is required")

      const { commentDestName, commentDestObj, errorMsg } =
        await getCommentDestination(to)
      if (errorMsg) throw new ApolloError(errorMsg, 400)

      const newComment = await new Comment({
        user_id,
        body,
        to: commentDestObj._id,
      }).save()

      if (commentDestName === "Blog") {
        await Blog.updateOne(
          { _id: commentDestObj._id },
          {
            $set: {
              nComments: +commentDestObj.nComments + 1,
            },
          }
        )
      } else if (commentDestName === "Post") {
        await Post.updateOne(
          { _id: commentDestObj._id },
          {
            $set: {
              nComments: +commentDestObj.nComments + 1,
            },
          }
        )
      } else if (commentDestName === "Product") {
        await Product.updateOne(
          { _id: commentDestObj._id },
          {
            $set: {
              nComments: +commentDestObj.nComments + 1,
            },
          }
        )
      } else if (commentDestName === "Comment") {
        await Comment.updateOne(
          { _id: commentDestObj._id },
          {
            $set: {
              nReplies: +commentDestObj.nReplies + 1,
            },
          }
        )
      }

      return {
        code: 201,
        success: true,
        message: "Comment sent successfully",
        data:
          commentDestName !== "Comment"
            ? commentData(newComment)
            : replyData(newComment),
      }
    } catch (err) {
      generateServerError(err)
    }
  },
}

module.exports = commentMutations
