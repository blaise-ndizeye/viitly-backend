const User = require("../models/User")
const { userData } = require("../helpers/userHelpers")

const customResolvers = {
  Review: {
    async from(parent) {
      const user = await User.findById(parent.from)
      return userData(user)
    },
    async to(parent) {
      const user = await User.findById(parent.from)
      return userData(user)
    },
  },
}

module.exports = customResolvers
