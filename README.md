# Wiitify API Service

**GraphQL** based API Service for manipulating data in the wiitify store/database.

> **Wiitify** is an marketing platform with the aim of connecting people with their product, blogs and post desires which help them to earn income while using the platform in different ways **<u>for example:</u>** _Getting discount on the products after confirming their requested coin-code by the product owner where user will be prized after confirming his/her coin-code product requests for at least `numberOfProductPrizes` set in `.env` file and other many ways_

#### It is composed with **Four access layers**

1. Admin Layer
1. Business Layer
1. Proffessional Layer
1. Personal Layer

> All these layers are composed of GraphQL **Mutations** and **Queries**. There are some which are specific to the layer while others are general.

## API Content Sections

<ul>
    <li><a href="#set-environment-variables">Set environment variables</a></li>
    <li><a href="#install-dependencies-and-start-development-server">Install dependencies and start development server</a></li>
    <li><a href="#special-requirements-for-requests">Special Requirements for requests</a></li>
    <li><a href="#object-types">Object Types</a></li>
    <li><a href="#general-queries">General Queries</a></li>
    <li><a href="#general-mutations">General Mutations</a></li>
    <li><a href="#personal-specific-mutations">Personal Specific Mutations</a></li>
    <li><a href="#admin-specific-queries">Admin Specific Queries</a></li>
    <li><a href="#admin-specific-mutations">Admin Specific Mutations</a></li>
    <li><a href="#admin-and-business-queries">Admin and Business Queries</a></li>
    <li><a href="#admin-and-business-mutations">Admin and Business Mutations</a></li>
    <li><a href="#business-and-proffessional-mutations">Business and Proffessional Mutations</a></li>
    <li><a href="#admin-business-and-proffessional-mutations">Admin, Business and Proffessional Mutations</a></li>
</ul>

### Set environment variables

The following variables must be set in the `.env` file before starting to use the API

```
DEV_DB_URL = mongodb://127.0.0.1:27017/wiitify # Development Database URL

PROD_DB_URL = mongodb://*******/wiitify # Production Database URL and not required in development

NODE_ENV = development or production

ACCESS_SECRET = ***random string***

PORT = 5000 # By default is 4000 but can be overwritten here and is set automatically in production

BASE_URL = http://localhost:5000 # The URL serving this API service and is required when serving the images and videos for the client

ASSETS_PER_POST = 3 # Maximum assets for the post to be uploaded by the proffessional, business and admin users

ASSETS_PER_PRODUCT = 7 # Maximum assets for the product to be uploaded by the business and admin users

HOST_EMAIL = email@example.com # Email sending the messages to the user for example when verifying accounts

HOST_EMAIL_PASSWORD = ***Host Email password***

BLOG_PRIZE_LIKES = 100 # Number of likes the blog must have to be prized

BLOG_PRIZE_SHARES = 50 # Number of shares the blog must have to be prized

POST_PRIZE_VIEWS = 500 # Number of views the post must have to be prized in case it is post containing a video

POST_PRIZE_LIKES = 100 # Number of likes the post must have to be prized

POST_PRIZE_SHARES = 50 # Number of shares the post must have to be prized

POST_BLOG_PRIZE_AMOUNT_IN_FRW = 3000 # Standard amount of money in Rwandan francs to be based on when prizing items in the system and varies according to increase of above defaults for the user

NUMBER_OF_PRODUCT_PRIZES = 2 # Number of confirmation of coin-code in which the user must have to start gaining income for his confirmed products

NUMBER_OF_FOLLOWER_PRIZES = 2 # Number of followers the proffesional user must have to start being prized
```

## Install dependencies and start development server

To install dependencies navigate in the terminal of the root folder and type:

_Recommended way_

```terminal
yarn
```

_If you prefer npm first delete `yarn.lock` file in the root folder and then type:_

```terminal
npm install
```

After all above steps you're ready to start development server, type:

```terminal
yarn dev
```

_For npm users_

```terminal
npm run dev
```

## Special Requirements for Requests

Except `Hello` Query all other queries and mutations require authorization header and other header key for mutations which modifies the files like uploading and deleting files to prevent `Cross-Site-Request-Forgery(CSRF) attack`.</br>

#### The following headers are required

```
Authorization: Bearer ***token***

Apollo-Require-Preflight: true
```

> When you provide the Authorization header and still get the CSRF error immediately add the Apollo-Require-Preflight header.

## Object Types

The following are different object types used in this api which are used to gquery data from graphql and will be used in many graphql queries to be returned by them.

> #### User Object Type

```graphql
  User {
    user_id
    avatar
    name
    user_name
    email
    phone
    whatsapp
    bio
    nFollowers
    nFollowings
    nBlogs
    nPosts
    nProducts
    nReviews
    new_messages
    new_notifications
    verified
    role
    createdAt
    blogs_upload_limit
    posts_upload_limit
    products_upload_limit
    followers {
        follower_id
        # ...Follower Object Data ...
    }
    followings {
        follower_id
        # ...Follower Object Data ...
    }
    reviews {
        review_id
        # ...Review Object Data ...
    }
    blogs {
        blog_id
        # ...Blog Object Data ...
    }
    posts {
        post_id
        # ...Post Object Data ...
    }
    products {
        product_id
        # ...Product Object Data ...
    }
    messages {
        message_id
        # ...Message Object Data ...
    }
    notifications {
        notification_id
        # ...Notification Object Data ...
    }
    wallets {
        wallet_id
        # ...Review Object Data ...
    }
    location {
        district
        # ...Location Object Data ...
    }
    transactions {
        transaction_id
        # ...Transaction Object Data ...
    }
    saved_products {
        product_id
        # ...Product Object Data ...
    }
    requested_products {
        request_id
        # ...RequestedProduct Object Data ...
    }
    prizes {
        prize_id
        # ...Prize Object Data ...
    }
  }
```

> #### Product Object Type

```graphql
 Product {
    product_id
    owner {
        user_id
        # ...User Object Data ...
    }
    title
    category
    price
    price_strategy
    price_currency
    availability
    description
    nLikes
    nComments
    nShares
    nViews
    createdAt
    blocked
    liked_by {
        user_id
        # ...User Object Data ...
    }
    shared_by {
        user_id
        # ...User Object Data ...
    }
    viewed_by {
        user_id
        # ...User Object Data ...
    }
    product_media {
        file_name
        # ...File object Data...
    }
    comments {
        comment_id
        # ...Comment Object Data ...
    }
  }
```

> #### Post Object Type

```graphql
  Post {
    post_id: ID!
    owner {
        user_id
        # ...User Object Data ...
    }
    description
    prized
    nLikes
    nComments
    nShares
    nViews
    createdAt
    blocked
    post_media {
        file_name
        # ...File object Data...
    }
    viewed_by {
        user_id
        # ...User Object Data ...
    }
    tagged_users {
        user_id
        # ...User Object Data ...
    }
     liked_by {
        user_id
        # ...User Object Data ...
    }
    shared_by {
        user_id
        # ...User Object Data ...
    }
    viewed_by {
        user_id
        # ...User Object Data ...
    }
    comments {
        comment_id
        # ...Comment Object Data ...
    }
  }
```

> #### Blog Object Type

```graphql
 Blog {
    blog_id
    owner {
        user_id
        # ...User Object Data ...
    }
    blog_title
    blog_content
    prized
    nLikes
    nComments
    nShares
    blocked
    createdAt
    blog_media {
        file_name
        # ...File object Data...
    }
    tagged_users {
        user_id
        # ...User Object Data ...
    }
     liked_by {
        user_id
        # ...User Object Data ...
    }
    shared_by {
        user_id
        # ...User Object Data ...
    }
    viewed_by {
        user_id
        # ...User Object Data ...
    }
    comments {
        comment_id
        # ...Comment Object Data ...
    }
  }
```

> #### File Object Type

```graphql
File {
  file_format
  file_name
}
```

> #### Review Object Type

```graphql
 Review {
    review_id
    rating
    description
    createdAt
    from {
        user_id
        # ...User Object Data ...
    }
    to {
        user_id
        # ...User Object Data ...
    }
  }
```

> #### RequestedProduct Object Type

```graphql
 RequestedProduct {
    request_id
    requestedAt
    product {
        product_id
        # ...Product Object Data ...
    }
    requested_by {
        user_id
        # ...User Object Data ...
    }
  }
```

> #### Reply Object Type

```graphql
 Reply {
    reply_id
    body
    createdAt
    nLikes
    from {
        user_id
        # ...User Object Data ...
    }
    liked_by {
        user_id
        # ...User Object Data ...
    }
  }
```

> #### Comment Object Type

```graphql
  Comment {
    comment_id
    from {
        user_id
        # ...User Object Data ...
    }
    to {
        __typename
        ...on Post {
            post_id
            # ...Post Object Data ...
        }
        ...on Blog {
            blog_id
            # ...Blog Object Data ...
        }
        ...on Product {
            product_id
            # ...Product Object Data ...
        }
        ...on Comment {
            comment_id
            # ...Comment Object Data ...
        }
    }
    body
    createdAt
    nLikes
    nReplies
    liked_by {
        user_id
        # ... User Object Data ...
    }
    replies {
        reply_id
        # ... Reply Object Data ...
    }
  }
```

> #### Message Object Type

```graphql
 Message {
    message_id
    from {
        user_id
        # ... User Object Data ...
    }
    to {
        user_id
        # ... User Object Data ...
    }
    text
    refer_type
    refer_item {
        __typename
       ...on Post {
           description
           # ...Post Object Data...
        }
        ...on Blog {
           blog_title
           # ...Blog Object Data...
        }
        ...on Product {
           category
           productDescription: description # Set alliases
           # ...Product Object Data...
        }
    }
    createdAt
    deleted_for_receiver
    deleted_for_sender
    forwarded
    seen
  }
```

> #### Notification Object Type

```graphql
 Notification {
    notification_id
    body
    createdAt
    refer_to {
      __typename
     ...on Blog {
        blog_id
        # ...Blog Object Data...
     }
     ...on Post {
        post_id
        # ...Post Object Data...
     }
     ...on Product {
        product_id
        # ...Product Object Data...
     }
     ...on User {
        user_name
        # ...User Object Data...
     }
     ...on Comment {
        comment_id
        # ...Comment Object Data...
     }
     ...on Reply {
        reply_id
        # # ...Reply Object Data...
     }
     ...on ReportedContent {
        reported_content_id
        # ...ReportedContent Object Data...
      }
    }
  }
```

> #### ReportedProblem Object Type

```graphql
 ReportedProblem {
    problem_id
    reporter {
        user_id
        # ...User Object Data ...
    }
    body
    solved
    createdAt
  }
```

> ### Wallet Object Type

```graphql
 Wallet {
    wallet_id
    price
    blogs_to_offer
    posts_to_offer
    products_to_offer
    scope
    currency
    createdAt
  }
```

> ### Location Object Type

```graphql
 Location {
    province
    district
    market_description
    latitude
    longitude
  }
```

> ### Transaction Object type

```graphql
 Transaction {
    transaction_id
    provider_trans_id
    amount_paid
    currency_used
    description
    transaction_role
    createdAt
    done_by {
        user_id
        # ...User Object Data ...
    }
  }
```

> ### Prize Object Type

```graphql
 Prize {
    prize_id
    owner {
        user_id
        # ...User Object Data ...
    }
    prize_event
    prize_amount
    prize_amount_currency
    prized
    prizedAt
  }
```

> ### ArchivedAccount Object Type

```graphql
 ArchivedAccount {
    archivedAt
    deleteAt
    account {
      user_id
      # ...User Object Data ...
    }
  }
```

> ### ReportedContent Object Type

```graphql
 ReportedContent {
    reported_content_id
    problem
    reportedAt
    content {
        __typename
       ...on Post {
           description
           # ...Post Object Data...
        }
        ...on Blog {
           blog_title
           # ...Blog Object Data...
        }
        ...on Product {
           category
           productDescription: description # Set alliases
           # ...Product Object Data...
        }
    }
    reported_by {
        user_id
        # ...User Object Data ...
    }
  }
```

> ### SearchResult Object Type

```graphql
 SearchResult {
    nBlogs
    nPosts
    nProducts
    nTransactions
    nAccounts
    blogs {
        blog_id
        # ...Blog Object Data ...
    }
    posts {
        post_id
        # ...Post Object Data ...
    }
    products {
        product_id
        # ...Product Object Data ...
    }
    transactions  {
        transaction_id
        # ...Transaction Object Data ...
    }
    accounts {
        user_id
        # ...User Object Data ...
    }
  }
```

## General Queries

These queries are accessible in all access layers (**PERSONAL, BUSINESS, PROFFESSIONAL and ADMIN**).

> ### Hello

This is query is used to get the greetings from the server.</br>

**Authorization header is not required**

```graphql
query {
  Hello
}
```

> ### GetFeed

This query is responsible of getting data in feed for the user and data are different depending on proffessional and business followers the user have.

_The blocked conent will not be displayed on any user's feed_

**Authorization header is required**

```graphql
query ($user_id: ID!) {
  GetFeed(user_id: $user_id) {
    __typename
    ... on Product {
      product_id
      # ...product Object Data...
    }
    ... on Post {
      post_id
      # ...Post Object Data ...
    }
    ... on Blog {
      blog_id
      # ...Blog Object Data ...
    }
  }
}
```

> ### GetUserData

This query is used to get the information about the current user.

**Authorization header is required**

```graphql
query ($user_id: ID!) {
  GetUserData(user_id: $user_id) {
    user_id
    user_name
    # ...User Object Data...
  }
}
```

> ### GetProductData

This query is used to get the information about the product that belongs to the user.

**Authorization header is required**

```graphql
query ($user_id: ID!, $product_id: ID!) {
  GetProductData(user_id: $user_id, product_id: $product_id) {
    product_id
    # ...Product Object Data ...
}
```

> ### GetPostData

This query is used to get the information about the post that belongs to the user.

**Authorization header is required**

```graphql
query ($user_id: ID!, $post_id: ID!) {
  GetPostData(user_id: $user_id, post_id: $post_id) {
    post_id
    # ...Post Object Data ...
}
```

> ### GetBlogData

This query is used to get the information about the blog that belongs to the user.

**Authorization header is required**

```graphql
query ($user_id: ID!, $blog_id: ID!) {
  GetBlogData(user_id: $user_id, blog_id: $blog_id) {
    blog_id
    # ...Blog Object Data ...
}
```

> ### Search

This query is used to search for items which matches with the search text provided and it searches in Users, Posts, Products, Blogs and Transactions but the user can get only the data he/she wants using the filter array

**Authorization header is required**

> > #### Query variables

```json
{
  "inputs": {
    "user_id": "",
    "searchtext": "",
    "filters": [] // It can contain only PRODUCT, POST, BLOG, TRANSACTION and ACCOUNT
  }
}
```

```graphql
query ($inputs: SearchInput!) {
  Search(inputs: $inputs) {
    nBlogs
    nPosts
    nProducts
    nTransactions
    nAccounts
    blogs {
      blog_id
      blog_title
      blog_content
      # ...Blog Object Data...
    }
    posts {
      post_id
      description
      prized
      # ...Post Object Data ...
    }
    products {
      product_id
      title
      category
      price
      # ...Product Object Data ...
    }
    transactions {
      transaction_id
      provider_trans_id
      amount_paid
      # ... Transaction Object Data ...
    }
    accounts {
      user_id
      user_name
      # ...User Object Data ...
    }
  }
}
```

> ### GetNewAccessToken

This query is used to get new access token for the user.

**Authorization header is required**

```graphql
query ($user_id: ID!) {
  GetNewAccessToken(user_id: $user_id)
}
```

> ### GetChatMessages

This query is used to get the chat messages for user who provided the user_id with the one whose id is provided as receptient_id.

**Authorization header is required**

```graphql
query ($user_id: ID!, $receptient_id: ID!) {
  GetChatMessages(user_id: $user_id, receptient_id: $receptient_id) {
    message_id
    # ... Massage Object Data ...
  }
}
```

## General Mutations

These are mutations which are accessible with all the layers.

> ### LoginUser

This mutation is used to log in the user in the system by providing the access token</br>

_When the user deletes his/her account then the account will be archived and unless the user logs in the account it will be deleted after one month_

**Authorization header is not required**

```graphql
# **credential** can be username, phone number, whatsapp number or email

mutation ($credential: String!, $password: String!) {
  LoginUser(credential: $credential, password: $password) {
    code
    success
    message
    accessToken
    user {
      user_id
      user_name
      # ...User Object Data ...
    }
  }
}
```

> ### RegisterUser

This mutation is used to register new user and by default the account will get PERSONAL access layer permissions. The account will not be verified therefore the code will be sent to the user's email but in development the code to be used to verify account is **101010**; then the user will directly be logged in by providing the access token.</br>

**Authorization header is not required** </br>
**Apollo-Require-Preflight header is required**

> > #### Mutation variables

```json
{
  "inputs": {
    "name": "",
    "user_name": "",
    "phone": "",
    "whatsapp": "",
    "email": "",
    "password": "",
    "confirm_password": ""
  }
}

// The avatar is optional when registering the user but can abe appended in the file section as avatar
```

```graphql
mutation ($inputs: UserInput!, $avatar: Upload) {
  RegisterUser(inputs: $inputs, avatar: $avatar) {
    code
    success
    message
    accessToken
    user {
      user_id
      user_name
      # ...User Object Data ...
    }
  }
}
```

> ### VerifyAccount

This mutation is used to verify user account and in develpoment **101010** is used as the verification code.

**Authorization header is required**

```graphql
mutation ($user_id: ID!, $verification_code: String!) {
  VerifyAccount(user_id: $user_id, verification_code: $verification_code) {
    code
    success
    message
  }
}
```

> ### RequestNewVerificationCode

This mutation is used to request new verification code in case there is a network problem which prevents the user from getting the code to his/her email. <br/>

_This feature is only accessible in **Production**._

**Authorization header is required**

```graphql
mutation ($user_id: ID!) {
  RequestNewVerificationCode(user_id: $user_id) {
    code
    success
    message
  }
}
```

> ### ForgotPassword

This mutation is used when the user forgets his/her password and it will then be used to reset the account's password and the password will be sent to the user's email but this will happen in **production** then in development the new password will be `WFY202020`.

**Authorization header is not required**

```graphql
# **credential** can be email, phone number, whatsapp number or username

mutation ($credential: String!) {
  ForgotPassword(credential: $credential) {
    code
    success
    message
  }
}
```

> ### ModifyUserBio

This mutation is used to update the profile bio for the user.

**Authorization header is required**

```graphql
mutation ($user_id: ID!, $bio: String!) {
  ModifyUserBio(user_id: $user_id, bio: $bio) {
    code
    success
    message
  }
}
```

> ### SendReview

This mutation is used to send the review to other user and this is helpful to know more information of the user.

**Authorization header is required**

> > #### Mutation variables

```json
{
  "inputs": {
    "description": "",
    "from": "", // the user sending a review
    "rating": 1, // Integer between 1 and 5
    "to": "" // the user to receive the review
  }
}
```

```graphql
mutation ($inputs: ReviewInput!) {
  SendReview(inputs: $inputs) {
    code
    success
    message
    review {
      review_id
      # ...Review Object Data...
    }
  }
}
```

> ### UpdateReview

This mutation is used to update the previously sent review by the user.

**Authorization header is required**

> > #### Mutation variables

```json
{
  "inputs": {
    "description": "",
    "rating": 1, // Integer between 1 and 5
    "user_id": "",
    "review_id": ""
  }
}
```

```graphql
mutation ($inputs: UpdateReviewInput!) {
  UpdateReview(inputs: $inputs) {
    code
    success
    message
    review {
      review_id
      # ...Review Object Data ...
    }
  }
}
```

> ### DeleteReview

This mutation is used to delete the previously sent review.

**Authorization header is required**

```graphql
mutation ($user_id: ID!, $review_id: ID!) {
  DeleteReview(user_id: $user_id, review_id: $review_id) {
    code
    success
    message
  }
}
```

> ### UpdateUserAvatar

This mutation is used to update or upload profile image of the user.

**Authorization header is required** </br>
**Apollo-Require-Preflight header is required**

```graphql
# avatar is the file to upload and must be a valid image

mutation ($user_id: ID!, $avatar: Upload!) {
  UpdateUserAvatar(user_id: $user_id, avatar: $avatar) {
    code
    success
    message
    accessToken
    user {
      user_id
      # ...User Object Data ...
    }
  }
}
```

> ### UpdateUserCredentials

This mutation is used to update the credentials or account information of the user.

**Authorization header is required**

> > #### Mutation variables

```json
{
  "inputs": {
    "email": "",
    "name": "",
    "old_password": "", // This is required and is the current password the user is using
    "password": "", // This is provided once the user wants to update his password otherwise pass an empty string
    "phone": "",
    "user_id": "",
    "user_name": "",
    "whatsapp": ""
  }
}
```

```graphql
mutation ($inputs: UpdateUserInput!) {
  UpdateUserCredentials(inputs: $inputs) {
    code
    success
    message
    accessToken
    user {
      user_id
      # ...User Object Data...
    }
  }
}
```

> ### CommitEvent

This mutation is used to **Like, Share, view, and Dislike** the content however **Share** event type will be set only after sharing the item on other platforms then it must be not sent until that feature is implemented in the front-end and in the backend and for sharing content to other users `ShareContent` mutation will be used. The **Dislike** event must be sent on the previously liked item only.

**Authorization header is required**

> > #### Mutation variables

```json
{
  "inputs": {
    "event_type": "", // LIKE, SHARE, VIEW, DISLIKE
    "parent_id": "", // The id of the content(Product, Post, Blog or Comment) on which the event is being committed
    "user_id": ""
  }
}
```

```graphql
mutation ($inputs: CommitEventInput!) {
  CommitEvent(inputs: $inputs) {
    code
    success
    message
  }
}
```

> ### ShareContent

This mutation is used to share the content to different users.

**Authorization header is required**

> > #### Mutation variables

```json
{
  "inputs": {
    "content_id": "", // the content id to be shared
    "share_to": ["User IDs"], // list of users to share the content
    "user_id": ""
  }
}
```

```graphql
mutation ($inputs: ShareContentInput!) {
  ShareContent(inputs: $inputs) {
    code
    success
    message
  }
}
```

> ### SendComment

**Authorization header is required**

> > #### Mutation variables

This mutation is used to send the comment to the **Product, Post, Blog or Comment**; when the comment is set to another comment it is a reply and that reply must not receive a comment again; It must be restricted in the design of the frontend.

```json
{
  "inputs": {
    "body": "",
    "to": "", // The id of content (Product, Post, Product, Comment except Reply)
    "user_id": ""
  }
}
```

```graphql
mutation ($inputs: SendCommentInput!) {
  SendComment(inputs: $inputs) {
    code
    success
    message
    data {
      __typename
      ... on Comment {
        comment_id
        # ...Comment Object Type ...
      }
      ... on Reply {
        reply_id
        # ...Reply Object Type ...
      }
    }
  }
}
```

> ### UpdateComment

This mutation is used to update the previously sent commment on certain product.

**Authorization header is required**

> > #### Mutation variables

```json
{
  "inputs": {
    "body": "",
    "comment_id": "",
    "user_id": ""
  }
}
```

```graphql
mutation ($inputs: UpdateCommentInput!) {
  UpdateComment(inputs: $inputs) {
    code
    success
    message
    data {
      __typename
      ... on Comment {
        comment_id
        # ...Comment Object Type ...
      }
      ... on Reply {
        reply_id
        # ...Reply Object Type ...
      }
    }
  }
}
```

> ### DeleteComment

This mutation is used used to delete previously sent comment.</br>

_The one who sent the comment is the one only who can delete it_.

**Authorization header is required**

```graphql
mutation ($user_id: ID!, $comment_id: ID!) {
  DeleteComment(user_id: $user_id, comment_id: $comment_id) {
    code
    success
    message
  }
}
```

> ### DeleteNotification

This mutation is used to delete the nitification sent to the user. the deletable notification for the user are those specified to his/her id otherwise there is no access to delete that notification for example if the `notification_type` is set to **ALL, BUSINESS, PROFFESSIONAL** meaning that if the type of notification is generalized to all users then it will not be deletable only **ADMIN can Delete it**.

**Authorization header is required**

```graphql
mutation ($user_id: ID!, $notification_id: ID!) {
  DeleteNotification(user_id: $user_id, notification_id: $notification_id) {
    code
    success
    message
  }
}
```

> ### MarkNotificationsAsRead

This mutation is used to mark the notification as read for and must be called for the specified user only when the user opens the notifications page.

**Authorization header is required**

```graphql
mutation ($user_id: ID!, $notification_ids: [ID!]!) {
  MarkNotificationsAsRead(
    user_id: $user_id
    notification_ids: $notification_ids
  ) {
    code
    success
    message
  }
}
```

> ### SendMessage

This message is used to send the message between the users and once the user can refer the object on which the message is related to. It depends on the design of the frotend whether the user can search and choose the id of the content to refer to or just adds it from a certain content detail page therefore it depends on the design.

**Authorization header is required**

> > #### Mutation variables

```json
{
  "inputs": {
    "from": "",
    "referFrom": "", // The id of the content(Post, Product or Blog) but not required
    "text": "", // message body
    "to": "" // The user to receive the message
  }
}
```

```graphql
mutation ($inputs: SendMessageInput!) {
  SendMessage(inputs: $inputs) {
    code
    success
    message # the sent text not the message Object
  }
}
```

> ### DeleteMessage

This mutation is used to delete previously sent message. When the user deletes message when the reciever didn't read it then it will be deleted permanently; If the sender deletes the message while the receiver have already read it the `deleted_for_sender`property of the message will be set to **true**; If the receiver deletes the message while the sender didn't delete it the `deleted_for_receiver` property of the message will be set to true and vice versa.. When one side deletes the message while the other side has also already deleted it then the message will be deleted permanently.

**Authorization header is required**

```graphql
mutation ($user_id: ID!, $message_id: ID!) {
  DeleteMessage(user_id: $user_id, message_id: $message_id) {
    code
    success
    message
  }
}
```

> ### MarkMessageAsRead

This mutation is used to mark the message as seen and must be called at the side of the message receiver only when the user opens the chat box.

**Authorization header is required**

```graphql
mutation ($user_id: ID!, $message_id: ID!) {
  MarkMessageAsRead(user_id: $user_id, message_id: $message_id) {
    code
    success
    message
  }
}
```

> ### SendFollowRequest

This mutation is used to send follow request to another user; When the request is sent to the requested user his/her followers will be increased directly increasing the number of followings for the current user.

**Authorization header is required**

```graphql
mutation ($user_id: ID!, $requested_user_id: ID!) {
  SendFollowRequest(user_id: $user_id, requested_user_id: $requested_user_id) {
    code
    success
    message
  }
}
```

> ### AcceptFollowRequest

This mutation is used to accept follow request sent by the other user; When the request is accepted it will increase the followers of the requested user and decreases also his/her followings.

**Authorization header is required**

```graphql
mutation ($user_id: ID!, $follower_id) {
  AcceptFollowRequest(user_id: $user_id, follower_id: $follower_id) {
    code
    success
    message
  }
}
```

> ### UnfollowUser

This mutation is used to unfollow the account that the current user has requested the follow request or already is his/her follower.

**Authorization header is required**

```graphql
mutation ($user_id: ID!, $follower_id: ID!) {
  UnfollowUser(user_id: $user_id, follower_id: $follower_id) {
    code
    success
    message
  }
}
```

> ### SaveProduct

This mutation is used to save the product so as to help the user to request the **coin-code** for that product.

**Authorization header is required**

```graphql
mutation ($user_id: ID!, $product_id: ID!) {
  SaveProduct(user_id: $user_id, product_id: $product_id) {
    code
    success
    message
  }
}
```

> ### DeleteSavedProduct

This mutation is used to delete the previously saved product.

**Authorization header is required**

```graphql
mutation ($user_id: ID!, $product_id: ID!) {
  DeleteSavedProduct(user_id: $user_id, product_id: $product_id) {
    code
    success
    message
  }
}
```

> ### RequestCoinCode

This mutation is used to request the coin-code for the saved product so that the user can get prizes and this is considered as transaction for the owner of the product because the coin-code product must be accepted when the user actually buys that product. And after the request rhe user will get the notification containing the coin-code for the product.

**Authorization header is required**

```graphql
mutation ($user_id: ID!, $product_id: ID!) {
  RequestCoinCode(user_id: $user_id, product_id: $product_id) {
    code
    success
    message
  }
}
```

> ### RequestPrizePayment

This mutation is used to request the payment for certain prizes earned by the user. If the type of the prize is earned based on acceptance of coin-code for the product the it will be offered when the user has at least `numberOfProductPrizes` accepted coin-code product requests inorder to get that prize payment.

**Authorization header is required**

```graphql
mutation ($user_id: ID!, $prize_id: ID!) {
  RequestPrizePayment(user_id: $user_id, prize_id: $prize_id) {
    code
    success
    message
  }
}
```

> ### ReportContent

This mutation is used to report inappropriate content, _<u>For example</u>_ when the product is harmful to the user or the post/blog contains bad stuffs to the environment then the user can report it and the admin will verify it and when he found that is bad stuff it will be blocked.

**Authorization header is required**

> > #### Mutation variables

```json
{
  "inputs": {
    "content_id": "", // the id of the content(Blog, Post or product) to be reported
    "problem": "",
    "user_id": ""
  }
}
```

```graphql
mutation ($inputs: ReportContentInput!) {
  ReportContent(inputs: $inputs) {
    code
    success
    message
  }
}
```

> ### ReportProblem

This mutation is used to report certain problem for example the problem about the functionality of user's account when some stuff work in unexpected way then the user can report the problem using this mutation. </br>

_By this mutation the user whose account is blocked can log is as usual but if he/she recieves an error saying that account is blocked he/she may have access to report that problem using this mutation_

**Authorization header is required**

```graphql
mutation ($user_id: ID!, $body: String!) {
  ReportProblem(user_id: $user_id, body: $body) {
    code
    success
    message
    reported_problem {
      problem_id
      # ...ReportedProblem Object Data...
    }
  }
}
```

> ### ArchiveAccount

This mutation is used to archive account for the user if he/she request to delete his/her account it will be archived and unless the user login again in that account in the following month it will be deleted after one month.

**Authorization header is required**

```graphql
mutation ($user_id: ID!) {
  ArchiveAccount(user_id: $user_id) {
    code
    success
    message
  }
}
```

## Personal Specific Mutations

These mutations are only accessible by **PERSONAL** account only

> > **Authorization header required for these mutations**

> ### SwitchToProAccount

This mutation is used to switch PERSONAL account to PROFFESSIONAL account; By this mutation there will be payment process to take place in the background.

> > #### Mutation variables

```json
{
  "inputs": {
    "user_id": "",
    "wallet_id": "" // The wallet to be used to get the amount of money to be paid by the user
  }
}
```

```graphql
mutation ($inputs: SwitchToProInputs!) {
  SwitchToProAccount(inputs: $inputs) {
    code
    success
    message
    accessToken
    user {
      user_id
      user_name
    }
  }
}
```

## Admin Specific Queries

These queries are only accessible to the admin. When other user tries to access it will get **not authorized** error response message.

> > **Authorization header is required** for all these queries.

> ### GetAllProducts

This query is used to get all products registered in the system.

```graphql
query ($user_id: ID!) {
  GetAllProducts(user_id: $user_id) {
    product_id
    # ...Product Object Data ...
  }
}
```

> ### GetAllPosts

This query is used to get all posts registered in the system.

```graphql
query ($user_id: ID!) {
  GetAllPosts(user_id: $user_id) {
    post_id
    # ...Post Object Data ...
  }
}
```

> ### GetAllBlogs

This query is used to get all blogs regstered in the system.

```graphql
query ($user_id: ID!) {
  GetAllBlogs(user_id: $user_id) {
    blog_id
    # ...Blog Bject Data...
  }
}
```

> ### GetAllUsers

This mutation is used to get all users registered in the system.

```graphql
query ($user_id: ID!) {
  GetAllUsers(user_id: $user_id) {
    user_id
    user_name
    # ...User Object Data ...
  }
}
```

> ### GetAllPendingPrizes

This mutation is used to get all prizes which are not paid yet meaning which the used has got but not yet requested for payment.

```graphql
query ($user_id: ID!) {
  GetAllPendingPrizes(user_id: $user_id) {
    prize_id
    prize_event
    prize_amount
    # ...Prize Object Data..
  }
}
```

> ### GetAllArchivedAccounts

This mutation is used to keep track of all archived accounts so that when 30 days are passed still archived then the admin can delete it.

```graphql
query ($user_id: ID!) {
  GetAllArchivedAccounts(user_id: $user_id) {
    archivedAt
    deleteAt
    # ...ArchivedAccount Object Data ...
  }
}
```

> ### GetAllReportedContents

This mutation is used to get all contents reported by users.

```graphql
query ($user_id: ID!) {
  GetAllReportedContents(user_id: $user_id) {
    reported_content_id
    problem
    reportedAt
    # ...ReportedContent Object Data ...
  }
}
```

> ### GetAllReportedProblems

This mutation is used to get all problems reported by users.

```graphql
query ($user_id: ID!) {
  GetAllReportedProblems(user_id: $user_id) {
    problem_id
    #...ReportedProblem Object Data...
  }
}
```

## Admin Specific Mutations

These mutations are only accessed by admin user.

> > **Authorization header is required** for all these mutations.

> ### BlockReportedContent

This mutation is used to block the reported content when found that it is inappropriate then it will be prevented from being displayed on any other user's feed.

```graphql
mutation ($user_id: ID!, $reported_content_id: ID!) {
  BlockReportedContent(
    user_id: $user_id
    reported_content_id: $reported_content_id
  ) {
    code
    success
    message
  }
}
```

> ### CreateWallet

This mutation is used to create wallet to be used by different users to make some payment s on the platform for example for boosting resources or switching accounts.</br>

_Admin mut be careful when providing the scopes for the wallets because it will be displayed in that user's scope only and if the scope is not **BUSINESS** then the number of products to offer must be set to zero_.

> > #### Mutation variables

```json
{
  "inputs": {
    "blogs_to_offer": 1, // Integer
    "currency": "FRW", // FRW or USD
    "posts_to_offer": 1, // Integer
    "price": 10000, // Number depending on the currency
    "products_to_offer": 1, // Number
    "scope": "", // BUSINESS, PROFFESSIONAL, PERSONAL OR ALL
    "user_id": ""
  }
}
```

```graphql
mutation ($inputs: CreateWalletInput!) {
  CreateWallet(inputs: $inputs) {
    code
    success
    message
    wallet {
      wallet_id
      # ...Wallet Object Data ...
    }
  }
}
```

> ### UpdateWallet

This mutation is used to update the previously set wallet.

> > #### Mutation variables

```json
{
  "inputs": {
    "blogs_to_offer": 1, // Integer
    "currency": "FRW", // FRW or USD
    "posts_to_offer": 1, // Integer
    "price": 10000, // Number depending on the currency
    "products_to_offer": 1, // Number
    "scope": "", // BUSINESS, PROFFESSIONAL, PERSONAL OR ALL
    "user_id": "",
    "wallet_id": ""
  }
}
```

```graphql
mutation ($inputs: UpdateWalletInput!) {
  UpdateWallet(inputs: $inputs) {
    code
    success
    message
    wallet {
      wallet_id
      # ...Wallet Object Data ...
    }
  }
}
```

> ### DeleteWallet

This mutation is used to delete the previously set wallet

```graphql
mutation ($user_id: ID!, $wallet_id: ID!) {
  DeleteWallet(user_id: $user_id, wallet_id: $wallet_id) {
    code
    success
    message
  }
}
```

> ### ToggleProblemSolvedMark

This mutation is used to toggle the reported problem as solved or not and it helps to keep track of reported problems rather than deleting them.

```graphql
mutation ($user_id: ID!, $problem_id: ID!) {
  ToggleProblemSolvedMark(user_id: $user_id, problem_id: $problem_id) {
    code
    success
    message
    reported_problem {
      problem_id
      # ...ReportedProblem Object Data ...
    }
  }
}
```

> ### DeleteReportedProblem

This mutation is used to delete previously reported problem by users. It is recommended to delete it after making sure that it is solved.

```graphql
mutation ($user_id: ID!, $problem_id: ID!) {
  DeleteReportedProblem(user_id: $user_id, problem_id: $problem_id) {
    code
    success
    message
  }
}
```

> ### SwitchToAdminAccount

This mutation is used to switch the user to admin role.

```graphql
# receptient_id is the id of the user to be switched to admin role

mutation ($user_id: ID!, $receptient_id: ID!) {
  SwitchToAdminAccount(user_id: $user_id, receptient_id: $receptient_id) {
    code
    success
    message
  }
}
```

> ### SetAccount

This mutation is used to **BLOCK** and **UNBLOCK** other accounts and it must be used carefully because one admin can block other admin.

```graphql
# set can be BLOCK or UNBLOCK

mutation ($user_id: ID!, $receptient_id: ID!, $set: SetStatus!) {
  SetAccount(user_id: $user_id, receptient_id: $receptient_id, set: $set) {
    code
    success
    message
  }
}
```

## Admin and Business Queries

These queries are only accessible by **ADMIN** and **BUSINESS** users. </br>

> > **Authorization header required** for all these queries </br>

> ### GetBusinessRequestedProducts

This query is used to get all products of the business or admin account which are requested for coin-codes by other users and these are considered as the products which are about to be bought by those users who requested them.

```graphql
query ($user_id: ID!) {
  GetBusinessRequestedProducts(user_id: $user_id) {
    request_id
    requestedAt
    # ...RequestedProduct Object Data ...
  }
}
```

## Admin and Business Mutations

These mutations are only accessible by **ADMIN** and **BUSINESS** users.

> > **Authorization header is required** for all these mutations </br> **Apollo-Require-Preflight header is required** for all these mutations which tends to modify the uploaded files (images and videos)

> ### UploadProduct

This mutation is used to upload the product to wiitify store and this will decrease the the `products_upload_limit` for the user uploading it.<br/>

> > #### Mutation variables

**Allowed Categories:** _clothing, electronic, art, house, furniture, vehicle, jewerly, fashion, game, kitchen, service, movie_.

```json
{
  "inputs": {
    "availability": "", // SALE or RENT
    "category": "",
    "description": "",
    "price": 100.0, // Floating point number
    "price_currency": "FRW", // FRW or USD
    "price_strategy": "", // FIXED or NEGOTIATE
    "title": "",
    "user_id": ""
  }
  // **productMedia** array must contain valid images and videos and it is required
}
```

```graphql
mutation ($inputs: UploadProductInput!, $productMedia: [Upload!]!) {
  UploadProduct(inputs: $inputs, productMedia: $productMedia) {
    code
    success
    message
    product {
      product_id
      # ...Product Object Data ...
    }
  }
}
```

> ### UpdateProductText

This mutation is used to update Product Data excluding the files (images and videos) for the product.

**Apollo-Require-Preflight header is not required**

> > Mutation variables

```json
{
  "inputs": {
    "availability": "", // SALE or RENT
    "category": "", // Only accepted categories mentioned in the UploadProduct section
    "description": "",
    "price": 100.0, // Floating point number
    "price_currency": "FRW", // FRW or USD
    "price_strategy": "", // FIXED or NEGOTIATE
    "title": "",
    "user_id": "",
    "product_id": ""
  }
}
```

```graphql
mutation ($inputs: UpdateProductTextInput!) {
  UpdateProductText(inputs: $inputs) {
    code
    success
    message
    product {
      product_id
      # ...Product Object Data...
    }
  }
}
```

> ### UpdateProductMedia

This mutation is used to update the files (images and videos) of the product.

```graphql
# **ProductMedia** must contain image or video files

mutation ($user_id: ID!, $product_id: ID!, $productMedia: [Upload!]!) {
  UpdateProductMedia(
    user_id: $user_id
    product_id: $product_id
    productMedia: $productMedia
  ) {
    code
    success
    message
    product {
      product_id
      # ...Product Object Data..
    }
  }
}
```

> ### DeleteProduct

This mutation is used to delete the previously uploaded product. Once deleted it will take no effect on the `products_upload_limit`.

```graphql
mutation ($user_id: ID!, $product_id: ID!) {
  DeleteProduct(user_id: $user_id, product_id: $product_id) {
    code
    success
    message
  }
}
```

> ### AcceptCoinCodeProductRequest

This mutation is used to accept coin-code request for the product and this will be considered as the transaction of buying that specific product and when the owner sells on the price which is different with the set price he/she must first update the price of that product because the prize to offer to the one who is buying it calculated according to the price of that product. For the user requesting the prize if he/she has not completed `numberOfProductPrizes` coin-code accepted requests then the the prize will be marked as prized until it reaches to that number where the prize will be marked as unprized so as he/she can request real money for that prize.</br>

**Apollo-Require-Preflight header is not required**

> > #### Mutation variables

```json
{
  "inputs": {
    "coinCode": "", // coin-code sent to the one who requested the product
    "product_id": "", // id of the product which was requested
    "receptient_id": "", // id of the user who requested it
    "user_id": ""
  }
}
```

```graphql
mutation ($inputs: AcceptCoinCodeProductInput!) {
  AcceptCoinCodeProductRequest(inputs: $inputs) {
    code
    success
    message
  }
}
```

> ### DeclineCoinCodeProductRequest

This mutation is used to decline the request for coin-code sent by the user requesting that product.

**Apollo-Require-Preflight header is not required**

> > #### Mutation variables

```json
{
  "inputs": {
    "product_id": "", // id of the product which was requested
    "receptient_id": "", // id of the user who requested it
    "user_id": ""
  }
}
```

```graphql
mutation ($inputs: DeclineCoinCodeProductInput!) {
  DeclineCoinCodeProductRequest(inputs: $inputs) {
    code
    success
    message
  }
}
```

## Business and Proffessional Mutations

These mutations are only accessible by **BUSINESS** and **PROFFESSIONAL** accounts.

> > **Authorization header is required** for all these mutations </br>

> ### RequestPostBlogPrizes

This mutation is used to request for prizes of certain posts and blogs which have met the requirements for them to be prized.

```graphql
mutation ($user_id: ID!) {
  RequestPostBlogPrizes(user_id: $user_id) {
    code
    success
    message
    prizes {
      prize_id
      # ...Prize Object Data ...
    }
  }
}
```

## Admin, Business and Proffessional Mutations

These mutations are only accessible by **ADMIN**, **BUSINESS** and **PROFFESSIONAL** users. </br>

> > **Authorization header is required** for all these mutations </br> **Apollo-Require-Preflight header is required** for all these mutations which tends to modify the uploaded files (images and videos)

> ### UploadPost

This mutation is used to upload the post to wiitify store and this will decrease the the `posts_upload_limit` for the user uploading it.<br/>

> > #### Mutation variables

```json
{
  "inputs": {
    "user_id": "",
    "description": "",
    "tagged_users": ["User Ids"]
  }
  // postMedia array is required and must contain valid image or video files
}
```

```graphql
mutation ($inputs: PostInput!, $postMedia: [Upload!]!) {
  UploadPost(inputs: $inputs, postMedia: $postMedia) {
    code
    success
    message
    post {
      post_id
      # ...Post Object Data ...
    }
  }
}
```

> ### UpdatePostText

This mutation is used to update the information about the post apart from the image or video files for the post. </br>

**Apollo-Require-Preflight header not required**

> > #### Mutation variables

```json
{
  "inputs": {
    "description": "",
    "post_id": "",
    "user_id": ""
  }
}
```

```graphql
mutation ($inputs: UpdatePostTextInput!) {
  UpdatePostText(inputs: $inputs) {
    code
    success
    message
    post {
      post_id
      # ...Post Object Data ...
    }
  }
}
```

> ### UpdatePostMedia

This mutation is used to update the post image or video filesfor the user.

> > #### Mutation variables

```json
{
  "inputs": {
    "post_id": "",
    "user_id": ""
  }
  // The postMedia array is required containing the valid image or video files
}
```

```graphql
mutation ($inputs: UpdatePostMediaInput!, $postMedia: [Upload!]!) {
  UpdatePostMedia(inputs: $inputs, postMedia: $postMedia) {
    code
    success
    message
    post {
      post_id
      # ...Post Object Data ...
    }
  }
}
```

> ### DeletePost

This mutation is used to delete previously uploaded post and it will not take effect on `blogs_upload_limit` for the user.

```graphql
mutation ($user_id: ID!, $post_id: ID!) {
  DeletePost(user_id: $user_id, post_id: $post_id) {
    code
    success
    message
  }
}
```

> ### UploadBlog

This mutation is used to upload the blog to wiitify store and this will decrease the the `blogs_upload_limit` for the user uploading it.<br/>

> > #### Mutation variables

```json
{
  "inputs": {
    "user_id": "",
    "blog_title": "",
    "blog_content": "",
    "tagged_users": ["User Ids"]
  }
  // blogMedia must contain valid image file only but it is not required
}
```

```graphql
mutation ($inputs: BlogInput!, $blogMedia: Upload) {
  UploadBlog(inputs: $inputs, blogMedia: $blogMedia) {
    code
    success
    message
    blog {
      blog_id
      # ...Blog Object Data ...
    }
  }
}
```

> ### UpdateBlogText

This mutation is used to update the information about the blog apart from the associated image.

**Apollo-Require-Preflight header is not required**

> > #### Mutation variables

```json
{
  "inputs": {
    "blog_content": "",
    "blog_id": "",
    "blog_title": "",
    "user_id": ""
  }
}
```

```graphql
mutation ($inputs: UpdateBlogTextInput!) {
  UpdateBlogText(inputs: $inputs) {
    code
    success
    message
    blog {
      blog_id
      # ...Blog Object Data ...
    }
  }
}
```

> ### UpdateBlogMedia

This mutation is used to update the image file associate with the blog to be updated.

```graphql
# **blogMedia** must be a valid image file

mutation ($user_id: ID!, $blog_id: ID!, $blogMedia: Upload!) {
  UpdateBlogMedia(user_id: $user_id, blog_id: $blog_id, blogMedia: $blogMedia) {
    code
    success
    message
    blog {
      blog_id
      # ...Blog Object Data ...
    }
  }
}
```

> ### DeleteBlog

This mutation is used to delete the previously uploaded blog and this will not take effect on `blogs_upload_limit` for the user.

```graphql
mutation ($user_id: ID!, $blog_id: ID!) {
  DeleteBlog(user_id: $user_id, blog_id: $blog_id) {
    code
    success
    message
  }
}
```

> ### BoostResources

This mutation is used to boost resources once their limit reach to zero; The user will make payment of the resources based on the wallet he/she choose to go with.

**Apollo-Require-Preflight header is not required**

```graphql
mutation ($user_id: ID!, $wallet_id: ID!) {
  BoostResources(user_id: $user_id, wallet_id: $wallet_id) {
    code
    success
    message
    accessToken
    user {
      user_id
      user_name
      # ...User Object Data ...
    }
  }
}
```
