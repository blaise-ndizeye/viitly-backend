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
    if (user.role !== "ADMIN") return new ApolloError("Not authorized", 401)
  },
  isBusinessPerson(user) {
    if (user.role !== "BUSINESS") return new ApolloError("Not authorized", 401)
  },
}
