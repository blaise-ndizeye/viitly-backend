const { gql } = require("apollo-server-express")

const typeDefs = gql`
  enum Role {
    PERSONAL
    BUSINESS
    PROFFESSIONAL
  }
  type User {
    user_id: ID!
    name: String!
    user_name: String!
    email: String!
    phone: String!
    whatsapp: String!
    nFollowers: Float!
    nPosts: Float!
    nProducts: Float!
    verified: Boolean!
    role: Role!
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

  input UserInput {
    name: String!
    user_name: String!
    phone: String!
    whatsapp: String!
    email: String!
    password: String!
    confirmPassword: String!
  }

  type Query {
    hello: String!
  }
  type Mutation {
    RegisterUser(inputs: UserInput): LogUserResponse
  }
`

module.exports = typeDefs
