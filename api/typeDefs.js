const { gql } = require("apollo-server-express")

const typeDefs = gql`
  enum Role {
    ADMIN
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
    blogs_upload_limit: Int!
    posts_upload_limit: Int!
    products_upload_limit: Int!
    reviews: [Review!]!
    blogs: [Blog!]!
    posts: [Post!]!
  }

  type Review {
    review_id: ID!
    rating: Int!
    description: String!
    from: User!
    to: User!
    createdAt: String!
  }

  type File {
    file_format: String!
    file_name: String!
  }

  type Post {
    post_id: ID!
    owner: User!
    description: String
    prized: Boolean!
    nLikes: Int!
    nComments: Int!
    nShares: Int!
    nViews: Int!
    createdAt: String!
    tagged_users: [User!]!
    post_media: [File!]!
  }

  type Blog {
    blog_id: ID!
    owner: User!
    blog_title: String!
    blog_content: String!
    blog_media: File!
    prized: Boolean!
    nLikes: Int!
    nComments: Int!
    nShares: Int!
    nViews: Int!
    createdAt: String!
    tagged_users: [User!]!
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

  type PostResponse implements MutationResponse {
    code: Int!
    success: Boolean!
    message: String!
    post: Post!
  }

  type BlogResponse implements MutationResponse {
    code: Int!
    success: Boolean!
    message: String!
    blog: Blog!
  }

  type DeleteDataResponse implements MutationResponse {
    code: Int!
    success: Boolean!
    message: String!
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

  input PostInput {
    user_id: ID!
    description: String
    tagged_users: [String!]!
  }

  input BlogInput {
    user_id: ID!
    blog_title: String!
    blog_content: String!
    tagged_users: [String!]!
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
    DeleteReview(user_id: ID!, review_id: ID!): DeleteDataResponse!
    UploadPost(inputs: PostInput!, postMedia: [Upload!]): PostResponse!
    DeletePost(user_id: ID!, post_id: ID!): DeleteDataResponse!
    UploadBlog(inputs: BlogInput!, blogMedia: Upload): BlogResponse!
    DeleteBlog(user_id: ID!, blog_id: ID!): DeleteDataResponse!
  }
`

module.exports = typeDefs
