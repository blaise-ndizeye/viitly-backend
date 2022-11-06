const { GraphQLUpload } = require("graphql-upload")

const blogMutations = require("./blogs/blogMutations")
const blogQueries = require("./blogs/blogQueries")
const commentMutations = require("./comments/commentMutation")
const customResolvers = require("./customResolvers")
const eventMutations = require("./events/eventMutations")
const followMutations = require("./follow/followMutations")
const messageMutations = require("./messages/messageMutations")
const postMutations = require("./posts/postMutations")
const postQueries = require("./posts/postQueries")
const productMutations = require("./products/productMutations")
const productQueries = require("./products/productQueries")
const reviewMutations = require("./reviews/reviewsMutations")
const userMutations = require("./users/userMutations")
const userQueries = require("./users/userQueries")

const resolvers = {
  ...customResolvers,
  Query: {
    Hello: () => "hello there",
    ...userQueries,
    ...postQueries,
    ...productQueries,
    ...blogQueries,
  },
  Mutation: {
    ...blogMutations,
    ...commentMutations,
    ...eventMutations,
    ...followMutations,
    ...messageMutations,
    ...postMutations,
    ...productMutations,
    ...reviewMutations,
    ...userMutations,
  },
  Upload: GraphQLUpload,
}

module.exports = resolvers
