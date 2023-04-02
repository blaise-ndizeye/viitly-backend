const { ApolloError } = require("apollo-server-errors")

const Product = require("../../models/Product")
const CoinCodeProduct = require("../../models/CoinCodeProduct")
const SavedProduct = require("../../models/SavedProduct")
const { generateServerError } = require("../../helpers/errorHelpers")
const {
  isAdmin,
  isAuthenticated,
  isAccountVerified,
  isBusinessPerson,
  isValidUser,
} = require("../shield")
const {
  productData,
  requestedProductData,
} = require("../../helpers/productHelpers")

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

      const productExists = await Product.findOne({ _id: product_id })
      if (!productExists) throw new ApolloError("Product not found", 404)

      return productData(productExists)
    } catch (err) {
      generateServerError(err)
    }
  },
  async GetBusinessRequestedProducts(_, { user_id }, ctx, ___) {
    try {
      let requestedProducts = []

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isBusinessPerson(ctx.user)

      const userProducts = await Product.find({ user_id })
      for (let userProduct of userProducts) {
        const ccProduct = await CoinCodeProduct.findOne({
          product_id: userProduct._id.toString(),
        })

        if (ccProduct) {
          requestedProducts.push(ccProduct)
        } else continue
      }

      return requestedProducts.map((product) => requestedProductData(product))
    } catch (err) {
      generateServerError(err)
    }
  },
  async GetSavedProducts(_, { user_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      const savedProducts = await SavedProduct.find({ user_id })
      let relatedProducts = []

      for (let item of savedProducts) {
        const product = await Product.findOne({ _id: item.product_id })
        relatedProducts.push(product)
      }

      return relatedProducts.map((product) => productData(product))
    } catch (err) {
      generateServerError(err)
    }
  },
  async GetRequestedProducts(_, { user_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      const coinCodeProducts = await CoinCodeProduct.find({ user_id })

      return coinCodeProducts.map((ccProduct) =>
        requestedProductData(ccProduct)
      )
    } catch (err) {
      generateServerError(err)
    }
  },
}

module.exports = productQueries
