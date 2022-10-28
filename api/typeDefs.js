const { gql } = require("apollo-server-express")

const typeDefs = gql`
  enum Role {
    ADMIN
    PERSONAL
    BUSINESS
    PROFFESSIONAL
  }

  enum PriceStrategy {
    FIXED
    NEGOTIATE
  }

  enum PriceCurrency {
    FRW
    USD
  }

  enum ProductAvailability {
    SALE
    RENT
  }

  enum ReferType {
    PRODUCT
    POST
    BLOG
    NOTHING
  }

  enum EventType {
    LIKE
    SHARE
    VIEW
    DISLIKE
  }

  enum Currency {
    FRW
    USD
  }

  scalar Upload

  union CommentSource = Product | Post | Blog | Comment

  union ReferItem = Product | Post | Blog

  union CommentResponseObject = Comment | Reply

  union ReferNotificationObject = Product | Post | Blog | Comment | User | Reply

  type User {
    user_id: ID!
    avatar: String
    name: String!
    user_name: String!
    email: String!
    phone: String!
    whatsapp: String!
    nFollowers: Int!
    nFollowings: Int!
    nBlogs: Int!
    nPosts: Int!
    nProducts: Int!
    nReviews: Int!
    new_messages: Int!
    new_notifications: Int!
    verified: Boolean!
    role: Role!
    createdAt: String!
    blogs_upload_limit: Int!
    posts_upload_limit: Int!
    products_upload_limit: Int!
    followers: [Follower!]!
    followings: [Follower!]!
    reviews: [Review!]!
    blogs: [Blog!]!
    posts: [Post!]!
    products: [Product!]!
    messages: [Message!]!
    notifications: [Notification!]!
    wallets: [Wallet!]!
    location: Location!
    transactions: [Transaction!]!
    saved_products: [Product!]!
  }

  type Follower {
    following_id: ID!
    accepted: Boolean!
    user: User!
    follower: User!
    requestedAt: String!
    acceptedAt: String
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
    liked_by: [User!]!
    viewed_by: [User!]!
    shared_by: [User!]!
    tagged_users: [User!]!
    post_media: [File!]!
    comments: [Comment!]!
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
    liked_by: [User!]!
    shared_by: [User!]!
    createdAt: String!
    tagged_users: [User!]!
    comments: [Comment!]!
  }

  type Product {
    product_id: ID!
    owner: User!
    title: String!
    category: String!
    price: Float!
    price_strategy: PriceStrategy!
    price_currency: PriceCurrency!
    availability: ProductAvailability!
    description: String!
    prized: Boolean!
    nLikes: Int!
    nComments: Int!
    nShares: Int!
    nViews: Int!
    createdAt: String!
    liked_by: [User!]!
    shared_by: [User!]!
    viewed_by: [User!]!
    product_media: [File!]!
    comments: [Comment!]!
  }

  type Reply {
    reply_id: ID!
    from: User!
    body: String!
    createdAt: String!
    nLikes: Int!
    liked_by: [User!]!
  }

  type Comment {
    comment_id: ID!
    from: User!
    to: CommentSource!
    body: String!
    createdAt: String!
    nLikes: Int!
    nReplies: Int!
    liked_by: [User!]!
    replies: [Reply!]!
  }

  type Message {
    message_id: ID!
    from: User!
    to: User!
    text: String
    refer_type: ReferType
    refer_item: ReferItem
    createdAt: String!
    deleted_for_receiver: Boolean!
    deleted_for_sender: Boolean!
    forwarded: Boolean!
    seen: Boolean!
  }

  type Notification {
    notification_id: ID!
    body: String!
    refer_to: ReferNotificationObject
    createdAt: String!
  }

  type ReportedProblem {
    problem_id: ID!
    reporter: User!
    body: String!
    solved: Boolean!
    createdAt: String!
  }

  type Wallet {
    wallet_id: ID!
    price: Int!
    blogs_to_offer: Int!
    posts_to_offer: Int!
    products_to_offer: Int!
    scope: String!
    currency: Currency!
    createdAt: String!
  }

  type Location {
    province: String!
    district: String!
    market_description: String
    latitude: String
    longitude: String
  }

  type Transaction {
    transaction_id: ID!
    provider_trans_id: ID!
    amount_paid: Int!
    currency_used: String!
    description: String!
    transaction_role: String!
    createdAt: String!
    done_by: User!
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

  type ProductResponse implements MutationResponse {
    code: Int!
    success: Boolean!
    message: String!
    product: Product!
  }

  type DeleteDataResponse implements MutationResponse {
    code: Int!
    success: Boolean!
    message: String!
  }

  type ReportedProblemResponse implements MutationResponse {
    code: Int!
    success: Boolean!
    message: String!
    reported_problem: ReportedProblem!
  }

  type CommentResponse implements MutationResponse {
    code: Int!
    success: Boolean!
    message: String!
    data: CommentResponseObject!
  }

  type WalletResponse implements MutationResponse {
    code: Int!
    success: Boolean!
    message: String!
    wallet: Wallet!
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

  input UpdateUserInput {
    user_id: ID!
    name: String!
    user_name: String!
    phone: String!
    whatsapp: String!
    email: String!
    password: String
    old_password: String!
  }

  input PostInput {
    user_id: ID!
    description: String
    tagged_users: [String!]!
  }

  input UpdatePostTextInput {
    user_id: ID!
    post_id: ID!
    description: String!
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

  input UpdateBlogTextInput {
    user_id: ID!
    blog_id: ID!
    blog_title: String!
    blog_content: String!
  }

  input UpdatePostMediaInput {
    user_id: ID!
    post_id: ID!
  }

  input UploadProductInput {
    user_id: ID!
    title: String!
    category: String!
    price: Float!
    price_strategy: PriceStrategy!
    price_currency: PriceCurrency!
    availability: ProductAvailability!
    description: String!
  }

  input UploadProductTextInput {
    product_id: ID!
    user_id: ID!
    title: String!
    category: String!
    price: Float!
    price_strategy: PriceStrategy!
    price_currency: PriceCurrency!
    availability: ProductAvailability!
    description: String!
  }

  input SendCommentInput {
    user_id: ID!
    to: ID!
    body: String!
  }

  input UpdateCommentInput {
    user_id: ID!
    comment_id: ID!
    body: String!
  }

  input SendMessageInput {
    from: ID!
    to: ID!
    text: String!
    referFrom: String # The item from which the message was sent from but not required
  }

  input CommitEventInput {
    user_id: ID!
    parent_id: ID!
    event_type: EventType!
  }

  input CreateWalletInput {
    user_id: ID!
    price: Int!
    blogs_to_offer: Int!
    posts_to_offer: Int!
    products_to_offer: Int!
    currency: Currency!
    scope: String!
  }

  input UpdateWalletInput {
    user_id: ID!
    wallet_id: ID!
    price: Int!
    blogs_to_offer: Int!
    posts_to_offer: Int!
    products_to_offer: Int!
    scope: String!
    currency: Currency!
  }

  input SwitchToProInputs {
    user_id: ID!
    wallet_id: ID!
    province: String!
    district: String!
    market_description: String
    latitude: String
    longitude: String
  }

  input SwitchToBusinessInputs {
    user_id: ID!
    receptient_id: ID!
    blogs_to_offer: Int!
    posts_to_offer: Int!
    products_to_offer: Int!
  }

  input UpdateLocationInput {
    user_id: ID!
    province: String!
    district: String!
    market_description: String
    longitude: String
    latitude: String
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
    UpdatePostText(inputs: UpdatePostTextInput!): PostResponse!
    UpdatePostMedia(
      inputs: UpdatePostMediaInput!
      postMedia: [Upload!]!
    ): PostResponse!
    UploadBlog(inputs: BlogInput!, blogMedia: Upload): BlogResponse!
    DeleteBlog(user_id: ID!, blog_id: ID!): DeleteDataResponse!
    UpdateBlogText(inputs: UpdateBlogTextInput!): BlogResponse!
    UpdateBlogMedia(
      user_id: ID!
      blog_id: ID!
      blogMedia: Upload!
    ): BlogResponse!
    UploadProduct(
      inputs: UploadProductInput!
      productMedia: [Upload!]!
    ): ProductResponse!
    UpdateProductMedia(
      user_id: ID!
      product_id: ID!
      productMedia: [Upload!]!
    ): ProductResponse!
    UpdateProductText(inputs: UploadProductTextInput): ProductResponse!
    DeleteProduct(user_id: ID!, product_id: ID!): DeleteDataResponse!
    SendComment(inputs: SendCommentInput!): CommentResponse!
    DeleteComment(user_id: ID!, comment_id: ID!): DeleteDataResponse!
    UpdateComment(inputs: UpdateCommentInput!): CommentResponse!
    SendFollowRequest(user_id: ID!, requested_user_id: ID!): DeleteDataResponse! # ==> Not properly named inorder reuse the code for the response
    AcceptFollowRequest(user_id: ID!, follower_id: ID!): DeleteDataResponse! # ==> Not properly named inorder reuse the code for the response
    UnfollowUser(user_id: ID!, follower_id: ID!): DeleteDataResponse! # ==> Not properly named inorder to reuse the code for the response
    SendMessage(inputs: SendMessageInput!): DeleteDataResponse! # ==> Not properly named inorder to reuse the code for the response
    MarkMessageAsRead(user_id: ID!, message_id: ID!): DeleteDataResponse! # ==> Not properly named inorder to reuse the code for the response
    DeleteMessage(user_id: ID!, message_id: ID!): DeleteDataResponse!
    ReportProblem(user_id: ID!, body: String!): ReportedProblemResponse!
    ToggleProblemSolvedMark(
      user_id: ID!
      problem_id: ID!
    ): ReportedProblemResponse!
    DeleteReportedProblem(user_id: ID!, problem_id: ID!): DeleteDataResponse!
    UpdateUserAvatar(user_id: ID!, avatar: Upload!): LogUserResponse!
    UpdateUserCredentials(inputs: UpdateUserInput!): LogUserResponse!
    VerifyAccount(
      user_id: String!
      verification_code: String!
    ): DeleteDataResponse!
    RequestNewVerificationCode(user_id: ID!): DeleteDataResponse!
    CommitEvent(inputs: CommitEventInput!): DeleteDataResponse!
    MarkNotificationAsRead(
      user_id: ID!
      notification_id: ID!
    ): DeleteDataResponse!
    DeleteNotification(user_id: ID!, notification_id: ID!): DeleteDataResponse!
    CreateWallet(inputs: CreateWalletInput!): WalletResponse!
    UpdateWallet(inputs: UpdateWalletInput!): WalletResponse!
    DeleteWallet(user_id: ID!, wallet_id: ID!): DeleteDataResponse!
    SwitchToProAccount(inputs: SwitchToProInputs!): LogUserResponse!
    SwitchToBusinessAccount(inputs: SwitchToBusinessInputs!): LogUserResponse!
    UpdateUserLocation(inputs: UpdateLocationInput): LogUserResponse!
    BoostResources(user_id: ID!, wallet_id: ID!): LogUserResponse!
    SaveProduct(user_id: ID!, product_id: ID!): DeleteDataResponse! # This response is being reused for many objects for decreasing duplication
    DeleteSavedProduct(user_id: ID!, product_id: ID!): DeleteDataResponse!
  }
`

module.exports = typeDefs
