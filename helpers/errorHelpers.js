const { ApolloError } = require("apollo-server-errors")

module.exports = {
  generateServerError(err) {
    if (!err?.extensions) {
      throw new ApolloError(err.message, 500)
    } else {
      throw new ApolloError(err.message, err.extensions.code)
    }
  },
}
