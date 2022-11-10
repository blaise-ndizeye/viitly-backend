const User = require("../../models/User")
const ReportedProblems = require("../../models/ReportedProblems")
const ReportedContent = require("../../models/ReportedContent")
const Prize = require("../../models/Prize")
const Product = require("../../models/Product")
const Post = require("../../models/Post")
const Blog = require("../../models/Blog")
const Following = require("../../models/Following")
const ArchivedAccount = require("../../models/ArchivedAccount")
const { generateServerError } = require("../../helpers/errorHelpers")
const {
  isAdmin,
  isAuthenticated,
  isAccountVerified,
  isPayingUser,
  isValidUser,
} = require("../shield")
const {
  userData,
  generateAccessToken,
  archivedAccountData,
} = require("../../helpers/userHelpers")
const {
  problemData,
  reportedContentData,
} = require("../../helpers/problemHelpers")
const { prizeData, productData } = require("../../helpers/productHelpers")
const { shuffleArray } = require("../../helpers/customHelpers")
const { blogData } = require("../../helpers/blogHelpers")
const { postData } = require("../../helpers/postHelpers")

const userQueries = {
  async GetAllUsers(_, { user_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isAdmin(ctx.user)

      let allUsers = await User.find().sort({ _id: -1 })
      allUsers = allUsers.filter((user) => user._id.toString() !== user_id)

      return allUsers.map((user) => userData(user))
    } catch (err) {
      generateServerError(err)
    }
  },
  async GetUserData(_, { user_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      const user = await User.findOne({ _id: user_id })

      return userData(user)
    } catch (err) {
      generateServerError(err)
    }
  },
  async GetNewAccessToken(_, { user_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      const user = await User.findOne({ _id: user_id })
      const newAccessToken = await generateAccessToken(user)

      return newAccessToken
    } catch (err) {
      generateServerError(err)
    }
  },
  async GetAllReportedProblems(_, { user_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isAdmin(ctx.user)

      const allProblems = await ReportedProblems.find().sort({ _id: -1 })

      return allProblems.map((problem) => problemData(problem))
    } catch (err) {
      generateServerError(err)
    }
  },
  async GetAllReportedContents(_, { user_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isAdmin(ctx.user)

      const allReportedContents = await ReportedContent.find().sort({ _id: -1 })

      return allReportedContents.map((content) => reportedContentData(content))
    } catch (err) {
      generateServerError(err)
    }
  },
  async GetAllArchivedAccounts(_, { user_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isAdmin(ctx.user)

      const allArchivedAccounts = await ArchivedAccount.find().sort({ _id: -1 })

      return allArchivedAccounts.map((account) => archivedAccountData(account))
    } catch (err) {
      generateServerError(err)
    }
  },
  async GetAllPendingPrizes(_, { user_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isAdmin(ctx.user)

      const allPrizes = await Prize.find({ prized: false }).sort({ _id: 1 })

      return allPrizes.map((prize) => prizeData(prize))
    } catch (err) {
      generateServerError(err)
    }
  },
  async GetFeed(_, { user_id }, ctx, ___) {
    try {
      let feedData = []

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      const followers = await Following.find({
        $or: [
          { user_id },
          {
            $and: [{ follower_id: user_id }, { accepted: true }],
          },
        ],
      }).sort({ _id: -1 })

      // Get the items of the followers to be displayed on the feed
      if (followers.length > 0) {
        for (let follower of followers) {
          let followerProducts = [],
            followingProducts = [],
            followerPosts = [],
            followingPosts = [],
            followerBlogs = [],
            followingBlogs = []

          if (follower.user_id === user_id) {
            // when the user have been followed by other user

            const productList1 = await Product.find({
              user_id: follower.follower_id,
            })
            const postList1 = await Post.find({ user_id: follower.follower_id })
            const blogList1 = await Blog.find({ user_id: follower.follower_id })

            followerProducts = [...productList1]
            followerPosts = [...postList1]
            followerBlogs = [...blogList1]
          } else {
            // When the user have followed other user

            const productList2 = await Product.find({
              user_id: follower.user_id,
            })
            const postList2 = await Post.find({ user_id: follower.user_id })
            const blogList2 = await Blog.find({ user_id: follower.user_id })

            followingProducts = [...productList2]
            followingPosts = [...postList2]
            followingBlogs = [...blogList2]
          }

          // mixing the positions of the array feed data randomly
          let rearrangedData1 = shuffleArray([
            ...followingPosts,
            ...followerBlogs,
            ...followerProducts,
            ...followerPosts,
            ...followingBlogs,
            ...followingProducts,
          ])

          feedData = [...rearrangedData1, ...feedData]
        }
      }

      let remainingProducts = await Product.find()
      let remainingPosts = await Post.find()
      let remainingBlogs = await Blog.find()

      // Making sure that there are no duplicates in the feed data to be generated
      remainingProducts = remainingProducts.filter(
        (pr) => !feedData.includes(pr)
      )
      remainingPosts = remainingPosts.filter((po) => !feedData.includes(po))
      remainingBlogs = remainingBlogs.filter((bl) => !feedData.includes(bl))

      // mixing the positions of the array feed data randomly
      let rearrangedData2 = shuffleArray([
        ...remainingPosts,
        ...remainingBlogs,
        ...remainingProducts,
      ])

      feedData = [...feedData, ...rearrangedData2]

      return feedData.map((data) => {
        if (data) {
          if (data.price) return productData(data)
          if (data.blog_title) return blogData(data)

          return postData(data)
        }
      })
    } catch (err) {
      generateServerError(err)
    }
  },
}

module.exports = userQueries
