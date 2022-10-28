const { ApolloError } = require("apollo-server-errors")

const Product = require("../../models/Product")
const UploadScope = require("../../models/UploadScope")
const SavedProduct = require("../../models/SavedProduct")
const { generateServerError } = require("../../helpers/errorHelpers")
const {
  isValidUser,
  isAuthenticated,
  isAccountVerified,
  isBusinessPerson,
} = require("../shield")
const {
  validateCategory,
  productData,
} = require("../../helpers/productHelpers")
const {
  uploadManyFiles,
  deleteUploadedFile,
} = require("../../helpers/uploadHelpers")
const { uploadProductValidation } = require("../../validators")

const productMutations = {
  async UploadProduct(_, { inputs, productMedia }, ctx, ___) {
    try {
      const { user_id, title, category, price, description } = inputs

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isBusinessPerson(ctx.user)

      const userScope = await UploadScope.findOne({ user_id })
      if (userScope.products_available === 0)
        throw new ApolloError("Product upload limit reached", 400)

      const { categoryError } = validateCategory(category)
      if (categoryError) throw new ApolloError(categoryError, 400)

      const { error } = await uploadProductValidation({
        title,
        price,
        description,
      })
      if (error) throw new ApolloError(error, 400)

      const { error: productError, uploadedFiles } = await uploadManyFiles(
        productMedia,
        process.env.ASSETS_PER_PRODUCT
      )
      if (productError) throw new ApolloError(productError, 400)

      const newProduct = await new Product({
        ...inputs,
        category: category.toLowerCase(),
        product_media: uploadedFiles.map((file) => ({
          file_name: file.fileName,
          file_format: file.fileFormat,
        })),
      }).save()

      await UploadScope.updateOne(
        { _id: userScope._id },
        {
          $set: {
            products_available: userScope.products_available - 1,
          },
        }
      )

      return {
        code: 201,
        success: true,
        message: "Product uploaded successfully",
        product: productData(newProduct),
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async UpdateProductText(_, { inputs }, ctx, ___) {
    try {
      const {
        user_id,
        product_id,
        title,
        category,
        price,
        description,
        availability,
        price_strategy,
        price_currency,
      } = inputs

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isBusinessPerson(ctx.user)

      const productExist = await Product.findOne({
        $and: [{ _id: product_id }, { user_id }],
      })
      if (!productExist) throw new ApolloError("Product doesn't exist", 400)

      const { categoryError } = validateCategory(category)
      if (categoryError) throw new ApolloError(categoryError, 400)

      const { error } = await uploadProductValidation({
        title,
        price,
        description,
      })
      if (error) throw new ApolloError(error, 400)

      await Product.updateOne(
        { _id: productExist._id },
        {
          $set: {
            title,
            price,
            description,
            category,
            price_strategy,
            price_currency,
            availability,
          },
        }
      )

      const updatedProduct = await Product.findOne({ _id: productExist._id })

      return {
        code: 200,
        success: true,
        message: "Product updated successfully",
        product: productData(updatedProduct),
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async UpdateProductMedia(_, args, ctx, ___) {
    try {
      const { user_id, product_id, productMedia } = args

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isBusinessPerson(ctx.user)

      const productExist = await Product.findOne({
        $and: [{ _id: product_id }, { user_id }],
      })
      if (!productExist) throw new ApolloError("Product doesn't exist", 400)

      const { error, uploadedFiles } = await uploadManyFiles(
        productMedia,
        process.env.ASSETS_PER_PRODUCT
      )
      if (error) throw new ApolloError(error, 400)

      await Product.updateOne(
        { _id: productExist._id },
        {
          $set: {
            product_media: uploadedFiles.map((file) => ({
              file_name: file.fileName,
              file_format: file.fileFormat,
            })),
          },
        }
      )

      for (let media of productExist.product_media) {
        deleteUploadedFile(media.file_name)
      }

      const updatedProduct = await Product.findById(productExist._id)

      return {
        code: 200,
        success: true,
        message: "Product updated successfully",
        product: productData(updatedProduct),
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async DeleteProduct(_, { user_id, product_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isBusinessPerson(ctx.user)

      const productExist = await Product.findOne({
        $and: [{ _id: product_id }, { user_id }],
      })
      if (!productExist) throw new ApolloError("Product doesn't exist", 400)

      for (let media of productExist.product_media) {
        deleteUploadedFile(media.file_name)
      }

      await Product.deleteOne({ _id: productExist._id })

      return {
        code: 200,
        success: true,
        message: "Product deleted successfully",
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async SaveProduct(_, { user_id, product_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      if (!product_id || product_id.length < 5)
        throw new ApolloError("Product Id:=> product_id is required", 400)

      const productExists = await Product.findOne({ _id: product_id })
      if (!productExists) throw new ApolloError("Product not found", 404)

      if (productExists.user_id === user_id)
        throw new ApolloError("This is your own product", 400)

      await new SavedProduct({
        user_id,
        product_id: productExists._id.toString(),
      }).save()

      return {
        code: 200,
        success: true,
        message: "Product saved successfully",
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async DeleteSavedProduct(_, { user_id, product_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      if (!product_id || product_id.length < 5)
        throw new ApolloError("Product Id:=> product_id is required", 400)

      const savedProductExists = await SavedProduct.findOne({
        $and: [{ user_id }, { product_id }],
      })
      if (!savedProductExists)
        throw new ApolloError("Saved product not found", 404)

      await SavedProduct.deleteOne({ _id: savedProductExists._id })

      return {
        code: 200,
        success: true,
        message: "Saved Product deleted successfully",
      }
    } catch (err) {
      generateServerError(err)
    }
  },
}

module.exports = productMutations
