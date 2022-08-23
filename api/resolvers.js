const userMutations = require("./users/mutation")

const resolvers = {
  Query: {
    hello: () => "hello there",
  },
  Mutation: {
    ...userMutations,
  },
}

module.exports = resolvers
