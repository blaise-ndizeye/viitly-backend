const { ApolloError } = require("apollo-server-errors")

const Product = require("../../models/Product")
const { generateServerError } = require("../../helpers/errorHelpers")
const {
  isAdmin,
  isAuthenticated,
  isAccountVerified,
  isPayingUser,
  isValidUser,
} = require("../shield")
const { productData } = require("../../helpers/productHelpers")

const productQueries = {
  async GetAllProducts(_, { user_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isAdmin(ctx.user)

      let allProducts = await Product.find().sort({ _id: -1 })

      return allProducts.map((product) => productData(product))
    } catch (err) {
      generateServerError(err)
    }
  },
  async GetProductData(_, { user_id, product_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isPayingUser(ctx.user)

      const productExists = await Product.findOne({
        $and: [{ _id: product_id }, { user_id }],
      })
      if (!productExists) throw new ApolloError("Product not found", 404)

      return productData(productExists)
    } catch (err) {
      generateServerError(err)
    }
  },
}

module.exports = productQueries
