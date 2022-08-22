const { gql } = require("apollo-server-express")

const typeDefs = gql`
  type Query {
    hello: String!
  }
  type Mutation {
    mutate: String!
  }
`

module.exports = typeDefs
