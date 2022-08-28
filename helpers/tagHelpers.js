const User = require("../models/User")

module.exports = {
  async verifyTaggedUsers(tagged_users = []) {
    let validTaggedUsers = []

    if (tagged_users.length === 0)
      return {
        tagError: "",
        validTaggedUsers,
      }

    const taggedUsersExist = await User.find({ _id: { $in: tagged_users } })
    if (taggedUsersExist.length === 0)
      return {
        tagError: "Invalid tagged users",
        validTaggedUsers,
      }

    for (let user of taggedUsersExist) {
      validTaggedUsers.push(user._id.toString())
    }

    return {
      tagError: "",
      validTaggedUsers,
    }
  },
}
