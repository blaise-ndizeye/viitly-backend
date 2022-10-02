const { GraphQLUpload } = require("graphql-upload")

const blogMutations = require("./blogs/blogMutations")
const commentMutations = require("./comments/commentMutation")
const customResolvers = require("./customResolvers")
const postMutations = require("./posts/postMutations")
const productMutations = require("./products/productMutations")
const reviewMutations = require("./reviews/reviewsMutations")
const userMutations = require("./users/userMutations")

const resolvers = {
  ...customResolvers,
  Query: {
    hello: () => "hello there",
  },
  Mutation: {
    ...blogMutations,
    ...commentMutations,
    ...postMutations,
    ...productMutations,
    ...reviewMutations,
    ...userMutations,
  },
  Upload: GraphQLUpload,
}

module.exports = resolvers
