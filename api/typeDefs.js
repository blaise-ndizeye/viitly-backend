const { gql } = require("apollo-server-express")

const typeDefs = gql`
  enum Role {
    PERSONAL
    BUSINESS
    PROFFESSIONAL
  }

  scalar Upload

  type User {
    user_id: ID!
    avatar: String
    name: String!
    user_name: String!
    email: String!
    phone: String!
    whatsapp: String!
    nFollowers: Int!
    nPosts: Int!
    nProducts: Int!
    nReviews: Int!
    verified: Boolean!
    role: Role!
    createdAt: String!
    reviews: [Review!]!
  }

  type Review {
    review_id: ID!
    rating: Int!
    description: String!
    from: User!
    to: User!
    createdAt: String!
  }

  interface MutationResponse {
    code: Int!
    success: Boolean!
    message: String!
  }

  type LogUserResponse implements MutationResponse {
    code: Int!
    success: Boolean!
    message: String!
    accessToken: String!
    user: User!
  }

  type ReviewResponse implements MutationResponse {
    code: Int!
    success: Boolean!
    message: String!
    review: Review!
  }

  input UserInput {
    name: String!
    user_name: String!
    phone: String!
    whatsapp: String!
    email: String!
    password: String!
    confirm_password: String!
  }

  input ReviewInput {
    from: ID!
    to: ID!
    description: String!
    rating: Int!
  }

  input UpdateReviewInput {
    user_id: ID!
    review_id: ID!
    description: String!
    rating: Int!
  }

  type Query {
    hello: String!
  }

  type Mutation {
    RegisterUser(inputs: UserInput!, avatar: Upload): LogUserResponse!
    LoginUser(credential: String!, password: String!): LogUserResponse!
    SendReview(inputs: ReviewInput!): ReviewResponse!
    UpdateReview(inputs: UpdateReviewInput!): ReviewResponse!
  }
`

module.exports = typeDefs
