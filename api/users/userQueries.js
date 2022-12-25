const { ApolloError } = require("apollo-server-errors")

const User = require("../../models/User")
const ReportedProblems = require("../../models/ReportedProblems")
const ReportedContent = require("../../models/ReportedContent")
const Prize = require("../../models/Prize")
const Product = require("../../models/Product")
const Post = require("../../models/Post")
const Blog = require("../../models/Blog")
const Location = require("../../models/Location")
const Following = require("../../models/Following")
const Transaction = require("../../models/Transaction")
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
const { transactionData } = require("../../helpers/walletHelpers")

const userQueries = {
  async GetAllUsers(_, { user_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      let allUsers = await User.find().sort({ _id: -1 })
      allUsers = allUsers.filter((user) => user._id.toString() !== user_id)

      return allUsers.map((user) => userData(user))
    } catch (err) {
      generateServerError(err)
    }
  },
  async GetUserData(_, { user_id, receptient_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      let user = null

      if (receptient_id) {
        user = await User.findOne({ _id: receptient_id })
      } else {
        user = await User.findOne({ _id: user_id })
      }

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
              $and: [{ user_id: follower.follower_id }, { blocked: false }],
            })
            const postList1 = await Post.find({
              $and: [{ user_id: follower.follower_id }, { blocked: false }],
            })
            const blogList1 = await Blog.find({
              $and: [{ user_id: follower.follower_id }, { blocked: false }],
            })

            followerProducts = [...productList1]
            followerPosts = [...postList1]
            followerBlogs = [...blogList1]
          } else {
            // When the user have followed other user

            const productList2 = await Product.find({
              $and: [{ user_id: follower.user_id }, { blocked: false }],
            })
            const postList2 = await Post.find({
              $and: [{ user_id: follower.user_id }, { blocked: false }],
            })
            const blogList2 = await Blog.find({
              $and: [{ user_id: follower.user_id }, { blocked: false }],
            })

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
  async Search(_, { inputs }, ctx, ___) {
    try {
      const { user_id, searchText, filters = [] } = inputs

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      if (searchText.length === 0)
        throw new ApolloError("Search text is required", 400)

      const pr1 = Blog.find({
        $and: [
          { blocked: false },
          {
            $or: [
              { blog_title: { $regex: searchText, $options: "i" } },
              { blog_content: { $regex: searchText, $options: "i" } },
            ],
          },
        ],
      })
      const pr2 = Post.find({
        $and: [
          { blocked: false },
          {
            description: { $regex: searchText, $options: "i" },
          },
        ],
      })
      const pr3 = Product.find({
        $and: [
          { blocked: false },
          {
            $or: [
              { title: { $regex: searchText, $options: "i" } },
              { category: { $regex: searchText, $options: "i" } },
              { price_strategy: { $regex: searchText, $options: "i" } },
              { price_currency: { $regex: searchText, $options: "i" } },
              { availability: { $regex: searchText, $options: "i" } },
              { description: { $regex: searchText, $options: "i" } },
            ],
          },
        ],
      })
      const pr4 = User.find({
        $or: [
          { name: { $regex: searchText, $options: "i" } },
          { user_name: { $regex: searchText, $options: "i" } },
          { email: { $regex: searchText, $options: "i" } },
          { phone: { $regex: searchText, $options: "i" } },
          { whatsapp: { $regex: searchText, $options: "i" } },
        ],
      })
      const pr5 = Transaction.find({
        $and: [
          { user_id },
          {
            $or: [
              { currency_used: { $regex: searchText, $options: "i" } },
              { description: { $regex: searchText, $options: "i" } },
              { transaction_role: { $regex: searchText, $options: "i" } },
            ],
          },
        ],
      })

      let [
        blogsFound,
        postsFound,
        productsFound,
        accountsFound,
        transactionsFound,
      ] = await Promise.all([pr1, pr2, pr3, pr4, pr5])

      // Find the accounts based on locations
      const userLocations = await Location.find({
        $or: [
          { province: { $regex: searchText, $options: "i" } },
          { district: { $regex: searchText, $options: "i" } },
          { market_description: { $regex: searchText, $options: "i" } },
        ],
      })

      for (let location of userLocations) {
        const user = await User.findOne({ _id: location.user_id })
        accountsFound.push(user)
      }

      let showBlogs = filters.length === 0 || filters.includes("BLOG")
      let showPosts = filters.length === 0 || filters.includes("POST")
      let showProducts = filters.length === 0 || filters.includes("PRODUCT")
      let showAccounts = filters.length === 0 || filters.includes("ACCOUNT")
      let showTransactions =
        filters.length === 0 || filters.includes("TRANSACTION")

      return {
        nBlogs: showBlogs ? blogsFound.length : 0,
        nPosts: showPosts ? postsFound.length : 0,
        nProducts: showProducts ? productsFound.length : 0,
        nAccounts: showAccounts ? accountsFound.length : 0,
        nTransactions: showTransactions ? transactionsFound.length : 0,
        blogs: showBlogs ? blogsFound.map((blog) => blogData(blog)) : [],
        posts: showPosts ? postsFound.map((post) => postData(post)) : [],
        products: showProducts
          ? productsFound.map((product) => productData(product))
          : [],
        accounts: showAccounts
          ? accountsFound.map((account) => userData(account))
          : [],
        transactions: showTransactions
          ? transactionsFound.map((trans) => transactionData(trans))
          : [],
      }
    } catch (err) {
      generateServerError(err)
    }
  },
}

module.exports = userQueries
