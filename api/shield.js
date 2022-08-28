const { ApolloError } = require("apollo-server-errors")

module.exports = {
  isAuthenticated(ctx) {
    if (!ctx.user) throw new ApolloError(ctx.error, 401)
  },
  isValidUser(ctxUser, operatingUser) {
    if (ctxUser.user_id !== operatingUser)
      throw new ApolloError("Not authorized: Invalid operating user", 401)
  },
  isAdmin(user) {
    if (user.role !== "ADMIN") throw new ApolloError("Not authorized", 401)
  },
  isBusinessPerson(user) {
    if (user.role !== "BUSINESS") throw new ApolloError("Not authorized", 401)
  },
  isAccountVerified(user) {
    if (!user.verified)
      throw new ApolloError("Please first verify your account", 401)
  },
  isPayingUser(user) {
    if (user.role === "PERSONAL") throw new Error("Not authorized", 401)
  },
}
