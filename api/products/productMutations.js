const { ApolloError } = require("apollo-server-errors")

const CoinCodeProduct = require("../../models/CoinCodeProduct")
const Notification = require("../../models/Notification")
const Product = require("../../models/Product")
const UploadScope = require("../../models/UploadScope")
const SavedProduct = require("../../models/SavedProduct")
const ReportedContent = require("../../models/ReportedContent")
const Transaction = require("../../models/Transaction")
const Prize = require("../../models/Prize")
const Message = require("../../models/Message")
const Event = require("../../models/Event")
const Comment = require("../../models/Comment")
const { generateServerError } = require("../../helpers/errorHelpers")
const { getRandomNumber } = require("../../helpers/customHelpers")
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

      //* Deleting comment replies for the product
      const productComments = await Comment.find({
        to: productExist._id.toString(),
      })
      for (let productComment of productComments) {
        await Comment.deleteMany({ to: productComment._id.toString() })
        await Event.deleteMany({ parent_id: productComment._id.toString() })
      }

      //* Deleting all notifications related to product reports
      const allReports = await ReportedContent.find({
        content_id: productExist._id.toString(),
      })
      for (let report of allReports) {
        await Notification.deleteMany({ ref_object: report._id.toString() })
      }

      const pr1 = Product.deleteOne({ _id: productExist._id })
      const pr2 = SavedProduct.deleteMany({
        product_id: productExist._id.toString(),
      })
      const pr3 = ReportedContent.deleteMany({
        content_id: productExist._id.toString(),
      })
      const pr4 = Notification.deleteMany({
        ref_object: productExist._id.toString(),
      })
      const pr5 = CoinCodeProduct.deleteMany({
        product_id: productExist._id.toString(),
      })
      const pr6 = Message.deleteMany({
        refer_item: productExist._id.toString(),
      })
      const pr7 = Event.deleteMany({
        parent_id: productExist._id.toString(),
      })
      const pr8 = Comment.deleteMany({ to: productExist._id.toString() })

      await Promise.all([pr1, pr2, pr3, pr4, pr5, pr6, pr7, pr8])

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
  async RequestCoinCode(_, { user_id, product_id }, ctx, ___) {
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

      const productFound = await Product.findOne({ _id: product_id })

      let generatedCode = getRandomNumber(1000000, 9999999)
      await new CoinCodeProduct({
        product_id,
        user_id,
        coin_code: `CC${generatedCode}`,
      }).save()

      await new Notification({
        notification_type: "REQUEST_CC",
        ref_object: productFound._id.toString(),
        specified_user: user_id,
        body: `Request is sent to the product owner with coin-code: CC${generatedCode}`,
      }).save()

      await new Notification({
        notification_type: "REQUEST_CC",
        ref_object: productFound._id.toString(),
        specified_user: productFound.user_id,
        body: "You have new product sale suggestion with coin-code",
      }).save()

      return {
        code: 200,
        success: true,
        message: "Product requested successfully",
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async AcceptCoinCodeProductRequest(_, { inputs }, ctx, ___) {
    try {
      const { user_id, product_id, receptient_id, coinCode } = inputs

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isBusinessPerson(ctx.user)

      if (!product_id || product_id.length < 5)
        throw new ApolloError("Product Id:=> product_id is required", 400)

      if (!receptient_id || receptient_id.length < 5)
        throw new ApolloError("Receptient Id: receptient_id is required", 400)

      const productExists = await Product.findOne({
        $and: [{ user_id }, { product_id }],
      })
      if (!productExists) throw new ApolloError("Product not found", 404)

      const coinCodeProductExist = await CoinCodeProduct.findOne({
        $and: [
          { product_id: productExists._id.toString() },
          { user_id: receptient_id },
        ],
      })
      if (!coinCodeProductExist)
        throw new ApolloError("Requested coin-coded product not found", 400)

      if (coinCodeProductExist.coin_code !== coinCode)
        throw new ApolloError("Invalid Coin-Code", 400)

      await new Notification({
        notification_type: "ACCEPT_CC",
        ref_object: productExists._id.toString(),
        specified_user: coinCodeProductExist.user_id,
        body: `You have been prized for the requested product with coin-code: ${coinCodeProductExist.coin_code}`,
      }).save()

      await new Prize({
        user_id: coinCodeProductExist.user_id,
        prize_event: "ACCEPT_CC",
        prize_amount: productExists.price * 0.05,
        prize_amount_currency: productExists.price_currency,
      }).save()

      await CoinCodeProduct.deleteOne({ _id: coinCodeProductExist._id })

      await new Transaction({
        service_provider_gen_id: "WFY_SELL",
        user_id,
        amount_paid: productExists.price * 0.05,
        currency_used: productExists.price_currency,
        description: "Sell the product",
        transaction_role: "SELL",
      }).save()

      return {
        code: 200,
        success: true,
        message: "Product sold using coin-code successfully",
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async DeclineCoinCodeProductRequest(_, { inputs }, ctx, ___) {
    try {
      const { user_id, product_id, receptient_id } = inputs

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isBusinessPerson(ctx.user)

      if (!product_id || product_id.length < 5)
        throw new ApolloError("Product Id:=> product_id is required", 400)

      if (!receptient_id || receptient_id.length < 5)
        throw new ApolloError("Receptient Id: receptient_id is required", 400)

      const productExists = await Product.findOne({
        $and: [{ user_id }, { product_id }],
      })
      if (!productExists) throw new ApolloError("Product not found", 404)

      const coinCodeProductExists = await CoinCodeProduct.findOne({
        $and: [
          { product_id: productExists._id.toString() },
          { user_id: receptient_id },
        ],
      })
      if (!coinCodeProductExists)
        throw new ApolloError("Requested coin-coded product not found", 400)

      await new Notification({
        notification_type: "DECLINE_CC",
        ref_object: productExists._id.toString(),
        specified_user: coinCodeProductExists.user_id,
        body: `Your requested product with coin-code: ${coinCodeProductExists.coin_code} has been declined`,
      }).save()

      await CoinCodeProduct.deleteOne({ _id: coinCodeProductExists._id })

      return {
        code: 200,
        success: true,
        message: "Product request declined successfully",
      }
    } catch (err) {
      generateServerError(err)
    }
  },
}

module.exports = productMutations
