# Wiitify API Service

**GraphQL** based API Service for querying and manipulating data in the wiitify store/database.

**Wiitify** is an marketing platform with the aim of connecting people with their product, blogs and post desires which help the to earn income while using the platform in different ways **<u>for example:</u>** _Getting discount on the products after confirming their requested coin-code by the product owner. User will be prized after confirming his/her coin-code product requests for at least `numberOfProductPrizes` set in `.env` file_

#### It is composed with **Four access layers**

1. Admin Layer
1. Business Layer
1. Proffessional Layer
1. Personal Layer

> All these layers are composed of GraphQL **Mutations** and **Queries**. There are some which are specific to the layer while others are general.

## API Content Sections

> There are some queries which must be combined to operate one function meaning that the should be called from the client one following another for example _Updating the product where updating user avatar and updating user credentials must be used together._

<ul>
    <li><a href="#set-environment-variables">Set environment variables</a></li>
    <li><a href="#install-dependencies-and-start-development-server">Install dependencies and start development server</a></li>
    <li><a href="#special-requirements-for-requests">Special Requirements for requests</a></li>
    <li><a href="#object-types">Object Types</a></li>
    <li><a href="#general-queries">General Queries</a></li>
    <li><a href="#general-mutations">General Mutations</a></li>
    <li><a href="#admin-specific-queries">Admin Specific Queries</a></li>
    <li><a href="#admin-specific-mutations">Admin Specific Mutations</a></li>
    <li><a href="#business-specific-queries">Business Specific Queries</a></li>
    <li><a href="#business-specific-mutations">Business Specific Mutations</a></li>
    <li><a href="#proffessional-specific-queries">Proffessional Specific Queries</a></li>
    <li><a href="#proffessional-specific-mutations">Proffessional Specific Mutations</a></li>
    <li><a href="#personal-specific-queries">Personal Specific Queries</a></li>
    <li><a href="#personal-specific-mutations">Personal Specific Mutations</a></li>
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
The following headers are required

```
Authorization: Bearer ***token***

Apollo-Require-Preflight: true
```

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

These queries can be accessed in all layers identified above, others are accessed in only two layers, others acccessible in all layers except personal account layer.

> ### Hello

This is query is used to get the greetings from the server.</br>

**No authorization header required**

```graphql
query {
  Hello
}
```

> ### GetFeed

This query is responsible of getting data in feed for the user and data are different depending on proffessional and business followers the user have.

_The blocked conent will not be displayed on any user's feed_

**Authorization header required**

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

**Authorization header required**

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

**Authorization header required**

```graphql
query ($user_id: ID!, $product_id: ID!) {
  GetProductData(user_id: $user_id, product_id: $product_id) {
    product_id
    # ...Product Object Data ...
}
```

> ### GetPostData

This query is used to get the information about the post that belongs to the user.

**Authorization header required**

```graphql
query ($user_id: ID!, $post_id: ID!) {
  GetPostData(user_id: $user_id, post_id: $post_id) {
    post_id
    # ...Post Object Data ...
}
```

> ### GetBlogData

This query is used to get the information about the blog that belongs to the user.

**Authorization header required**

```graphql
query ($user_id: ID!, $blog_id: ID!) {
  GetBlogData(user_id: $user_id, blog_id: $blog_id) {
    blog_id
    # ...Blog Object Data ...
}
```

> ### Search

This query is used to search for items which matches with the search text provided and it searches in Users, Posts, Products, Blogs and Transactions but the user can get only the data he/she wants using the filter array

**Authorization header required**

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

**Authorization header required**

```graphql
query ($user_id: ID!) {
  GetNewAccessToken(user_id: $user_id)
}
```

> ### GetChatMessages

This query is used to get the chat messages for user who provided the user_id with the one whose id is provided as receptient_id.

**Authorization header required**

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

**No Authorization header required**

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

**No Authorization header required** </br>
**Apollo-Require-Preflight header required**

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

**Authorization header required**

```graphql
mutation ($user_id: ID!, $verification_code: String!) {
  VerifyAccount(user_id: $user_id, verification_code: $verification_code) {
    code
    success
    message
  }
}
```

> ### SendReview

This mutation is used to send the review to other user and this is helpful to know more information of the user.

**Authorization header required**

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

**Authorization header required**

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

**Authorization header required**

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

**Authorization header required** </br>
**Apollo-Require-Preflight header required**

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

**Authorization header required**

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

**Authorization header required**

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

**Authorization header required**

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

**Authorization header required**

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

**Authorization header required**

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

**Authorization header required**

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

**Authorization header required**

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

**Authorization header required**

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

**Authorization header required**

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

**Authorization header required**

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

**Authorization header required**

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

**Authorization header required**

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

**Authorization header required**

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

**Authorization header required**

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

**Authorization header required**

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

**Authorization header required**

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

**Authorization header required**

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

This mutation is used to request the prize payment for the coin-code acceptance prizes will be prized if the user has at least `numberOfProductPrizes` which is set in `.env` file.

**Authorization header required**

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

**Authorization header required**

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

This mutation is used to report certain problem for example the problem about the functionality of user's account when some stuff work in unexpected way then the user can report the problem using this mutation.

**Authorization header required**

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

**Authorization header required**

```graphql
mutation ($user_id: ID!) {
  ArchiveAccount(user_id: $user_id) {
    code
    success
    message
  }
}
```

## Admin Specific Queries

## Admin Specific Mutations

## Business Specific Queries

## Business Specific Mutations

## Proffessional Specific Queries

## Proffessional Specific Mutations

## Personal Specific Queries

## Personal Specific Mutations

> ### SwitchToProAccount

This mutation is used to switch PERSONAL account to PROFFESSIONAL account; By this mutation there will be payment process to take place in the background.

> > ### Mutation variables

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
