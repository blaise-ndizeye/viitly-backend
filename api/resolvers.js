const customResolvers = require("./customResolvers")
const reviewMutations = require("./reviews/reviewsMutations")
const userMutations = require("./users/userMutations")

const resolvers = {
  ...customResolvers,
  Query: {
    hello: () => "hello there",
  },
  Mutation: {
    ...reviewMutations,
    ...userMutations,
  },
}

module.exports = resolvers
