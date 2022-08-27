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
    avatar: Upload
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

  type TestUploadResponse {
    fileName: String!
    fileFormat: String!
  }

  type Query {
    hello: String!
  }

  type Mutation {
    RegisterUser(inputs: UserInput!): LogUserResponse!
    LoginUser(credential: String!, password: String!): LogUserResponse!
    SendReview(inputs: ReviewInput!): ReviewResponse!
    TestUpload(file: Upload!): TestUploadResponse
  }
`

module.exports = typeDefs
