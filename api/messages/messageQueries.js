const { ApolloError } = require("apollo-server-errors")

const Message = require("../../models/Message")
const User = require("../../models/User")
const { generateServerError } = require("../../helpers/errorHelpers")
const { isAuthenticated, isAccountVerified, isValidUser } = require("../shield")
const { messageData } = require("../../helpers/messageHelpers")

const messageQueries = {
  async GetChatMessages(_, { user_id, receptient_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      const receptientExists = await User.findOne({ _id: receptient_id })
      if (!receptientExists) throw new ApolloError("Receptient not found", 404)

      const messageList = await Message.find({
        $or: [
          {
            $and: [{ from: user_id }, { to: receptientExists._id.toString() }],
          },
          {
            $and: [{ from: receptientExists._id.toString() }, { to: user_id }],
          },
        ],
      }).sort({ _id: 1 })

      return messageList.map((message) => messageData(message))
    } catch (err) {
      generateServerError(err)
    }
  },
}

module.exports = messageQueries
