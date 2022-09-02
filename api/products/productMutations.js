const { ApolloError } = require("apollo-server-errors")

const Product = require("../../models/Product")
const UploadScope = require("../../models/UploadScope")
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
const { uploadManyFiles } = require("../../helpers/uploadHelpers")
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
}

module.exports = productMutations
