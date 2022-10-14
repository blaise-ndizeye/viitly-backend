const { ApolloError } = require("apollo-server-errors")

const Message = require("../../models/Message")
const User = require("../../models/User")
const Product = require("../../models/Product")
const Post = require("../../models/Post")
const Blog = require("../../models/Blog")
const { isAuthenticated, isAccountVerified, isValidUser } = require("../shield")
const { generateServerError } = require("../../helpers/errorHelpers")

const messageMutations = {
  async SendMessage(_, { inputs }, ctx, ___) {
    try {
      const { from, to = "", text = "", referFrom = "" } = inputs

      isAuthenticated(ctx)
      isValidUser(ctx.user, from)
      isAccountVerified(ctx.user)

      if (!to || to.length < 5)
        throw new ApolloError("The receiver => [to] is required", 400)

      if (from === to)
        throw new ApolloError("You can not send message to your self", 400)

      if (text.length === 0 && referFrom.length === 0)
        throw new ApolloError("Message is required", 400)

      const receiverExists = await User.findOne({ _id: to })
      if (!receiverExists)
        throw new ApolloError("The receiver of the message not found", 400)

      let refer_type = ""
      let refer_item = ""
      if (referFrom.length > 0) {
        const bl = Blog.findOne({ _id: referFrom })
        const pr = Product.findOne({ _id: referFrom })
        const po = Post.findOne({ _id: referFrom })

        const [blogFound, productFound, postFound] = await Promise.all([
          bl,
          pr,
          po,
        ])

        if (!blogFound && !productFound && !postFound)
          throw new ApolloError("The referred item not found", 400)

        if (blogFound) {
          refer_type = "BLOG"
          refer_item = blogFound._id.toString()
        }
        if (productFound) {
          refer_type = "PRODUCT"
          refer_item = productFound._id.toString()
        }
        if (postFound) {
          refer_type = "POST"
          refer_item = postFound._id.toString()
        }
      }

      const newMessage = await new Message({
        from,
        to,
        text,
        refer_type,
        refer_item,
      }).save()

      return {
        code: 201,
        success: true,
        message: newMessage.text,
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async MarkMessageAsRead(_, { user_id, message_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      const messageExists = await Message.findOne({
        $and: [{ _id: message_id }, { to: user_id }],
      })

      if (!messageExists)
        return {
          code: 200,
          success: false,
          message: "Not the receiver",
        }

      await Message.updateOne(
        { _id: messageExists._id },
        {
          $set: {
            seen: true,
          },
        }
      )

      return {
        code: 200,
        success: true,
        message: `${messageExists._id.toString().substr(3, 7)} Marked as seen`,
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async DeleteMessage(_, { user_id, message_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      const messageExists = await Message.findOne({
        $and: [
          { _id: message_id },
          { $or: [{ to: user_id }, { from: user_id }] },
        ],
      })

      if (!messageExists)
        return {
          code: 200,
          success: false,
          message: "Message not found",
        }

      if (
        (messageExists.from === user_id &&
          messageExists.deleted_for_receiver) ||
        (messageExists.to === user_id && messageExists.deleted_for_sender) ||
        (messageExists.from === user_id && !messageExists.seen)
      ) {
        await Message.deleteOne({ _id: messageExists._id })
      } else if (
        messageExists.from === user_id &&
        !messageExists.deleted_for_receiver
      ) {
        await Message.updateOne(
          { _id: messageExists._id },
          {
            $set: {
              deleted_for_sender: true,
            },
          }
        )
      } else if (
        messageExists.to === user_id &&
        !messageExists.deleted_for_sender
      ) {
        await Message.updateOne(
          { _id: messageExists._id },
          {
            $set: {
              deleted_for_receiver: true,
            },
          }
        )
      }

      return {
        code: 200,
        success: true,
        message: "Message deleted",
      }
    } catch (err) {
      generateServerError(err)
    }
  },
}

module.exports = messageMutations
