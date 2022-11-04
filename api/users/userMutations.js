const bcrypt = require("bcryptjs")
const { ApolloError } = require("apollo-server-errors")

const Location = require("../../models/Location")
const User = require("../../models/User")
const UploadScope = require("../../models/UploadScope")
const Notification = require("../../models/Notification")
const ReportedProblems = require("../../models/ReportedProblems")
const Transaction = require("../../models/Transaction")
const Wallet = require("../../models/Wallet")
const Blog = require("../../models/Blog")
const Post = require("../../models/Post")
const Product = require("../../models/Product")
const Prize = require("../../models/Prize")
const Event = require("../../models/Event")
const Message = require("../../models/Message")
const Following = require("../../models/Following")
const ReportedContent = require("../../models/ReportedContent")
const SavedProduct = require("../../models/SavedProduct")
const Reviews = require("../../models/Reviews")
const Comment = require("../../models/Comment")
const CoinCodeProduct = require("../../models/CoinCodeProduct")
const ArchivedAccount = require("../../models/ArchivedAccount")
const {
  registerUserValidation,
  loginUserValidation,
} = require("../../validators")
const { userData, generateAccessToken } = require("../../helpers/userHelpers")
const {
  uploadOneFile,
  deleteUploadedFile,
} = require("../../helpers/uploadHelpers")
const { generateServerError } = require("../../helpers/errorHelpers")
const {
  isAdmin,
  isAuthenticated,
  isAccountVerified,
  isPayingUser,
  isValidUser,
} = require("../shield")
const { problemData } = require("../../helpers/problemHelpers")
const mailTransporter = require("../../utils/mail/send")
const { getRandomNumber } = require("../../helpers/customHelpers")
const { walletData } = require("../../helpers/walletHelpers")
const { makePayment, offerPayment } = require("../../helpers/paymentHelpers")
const { prizeData } = require("../../helpers/productHelpers")
const { verifyTaggedUsers } = require("../../helpers/tagHelpers")

const userMutations = {
  async RegisterUser(_, args, __, ___) {
    try {
      const data = args.inputs
      const {
        name,
        email,
        user_name,
        phone,
        whatsapp,
        password,
        confirm_password,
      } = data

      const { error } = await registerUserValidation({
        name,
        email,
        phone,
        user_name,
        whatsapp,
        password,
        confirm_password,
      })
      if (error) throw new ApolloError(error, 400)

      if (data.password !== data.confirm_password)
        throw new ApolloError("Passwords must match", 400)

      const userNameExists = User.findOne({ user_name: data.user_name })
      const phoneExists = User.findOne({ phone: data.phone })
      const whatsappExists = User.findOne({ whatsapp: data.whatsapp })
      const emailExists = User.findOne({ email: data.email })

      const [pr1, pr2, pr3, pr4] = await Promise.all([
        userNameExists,
        phoneExists,
        whatsappExists,
        emailExists,
      ])

      if (pr1) throw new ApolloError("Username is not available", 400)
      if (pr2) throw new ApolloError("Phone number is already registered", 400)
      if (pr3)
        throw new ApolloError("Whatsapp number is already registered", 400)
      if (pr4) throw new ApolloError("Email is already registered", 400)

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(data.password, salt)

      let userProfileImage = ""
      if (args.avatar) {
        const { error, fileName } = await uploadOneFile(args.avatar, "image")
        if (error) throw new ApolloError(error, 400)
        userProfileImage = fileName
      }

      const newUser = await new User({
        ...data,
        avatar: userProfileImage,
        user_name: user_name.toLowerCase(),
        password: hashedPassword,
      }).save()

      await new UploadScope({ user_id: newUser._id.toString() }).save()

      if (process.env.NODE_ENV === "production") {
        let generatedCode = getRandomNumber(100000, 999999)

        const transport = mailTransporter({
          hostUser: process.env.HOST_EMAIL,
          hostUserPassword: process.env.HOST_EMAIL_PASSWORD,
          to: [email],
          subject: "Welcome to your Wiitify account",
          bodyText: `${generatedCode} is your account verification code.`,
        })

        const update = User.updateOne(
          { _id: newUser._id },
          {
            $set: {
              verification_code: generatedCode,
            },
          }
        )

        await Promise.all([transport, update])
      }

      const accessToken = await generateAccessToken(newUser)

      return {
        code: 201,
        success: true,
        message: "User registered successfully",
        accessToken,
        user: userData(newUser),
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async LoginUser(_, args, __, ___) {
    try {
      const { credential, password } = args

      const { error } = await loginUserValidation({ credential, password })
      if (error) throw new ApolloError(error, 400)

      const userExists = await User.findOne({
        $or: [
          { user_name: credential.toLowerCase() },
          { phone: credential },
          { email: credential },
          { whatsapp: credential },
        ],
      })
      if (!userExists) throw new ApolloError("Account doesn't exist", 400)

      const passwordMatch = await bcrypt.compare(password, userExists.password)
      if (!passwordMatch) throw new ApolloError("Incorrect password", 400)

      if (userExists.archived) {
        await User.updateOne(
          { _id: userExists._id },
          {
            $set: {
              archived: false,
            },
          }
        )

        await ArchivedAccount.deleteOne({ user_id: userExists._id.toString() })
      }

      const accessToken = await generateAccessToken(userExists)

      return {
        code: 200,
        success: true,
        message: "Logged in successfully",
        accessToken,
        user: userData(userExists),
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async ReportProblem(_, { user_id, body }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      if (ctx.user.role === "ADMIN")
        throw new ApolloError(
          "Problems can be reported by users which are not admins",
          400
        )
      if (!body || body.length < 10)
        throw new ApolloError(
          "The problem must contain at least 10 characters and more descriptive",
          400
        )

      const newProblem = await new ReportedProblems({
        user_id,
        body,
      }).save()

      return {
        code: 200,
        success: true,
        message: "The problem was reported successfully",
        reported_problem: problemData(newProblem),
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async DeleteReportedProblem(_, { user_id, problem_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isAdmin(ctx.user)

      if (!problem_id || problem_id.length < 5)
        throw new ApolloError(
          "Reported Problem Id => [problem_id] is required",
          400
        )

      const problemExists = await ReportedProblems.findOne({ _id: problem_id })
      if (!problemExists)
        throw new ApolloError("Reported Problem not found", 400)

      await ReportedProblems.deleteOne({ _id: problemExists._id })
      return {
        code: 200,
        success: true,
        message: "Problem deleted successfully",
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async ToggleProblemSolvedMark(_, { user_id, problem_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isAdmin(ctx.user)

      if (!problem_id || problem_id.length < 5)
        throw new ApolloError(
          "Reported Problem Id => [problem_id] is required",
          400
        )

      const problemExists = await ReportedProblems.findOne({
        _id: problem_id,
      })
      if (!problemExists)
        throw new ApolloError("Reported Problem not found", 400)

      if (!problemExists.solved) {
        await ReportedProblems.updateOne(
          {
            _id: problemExists._id,
          },
          {
            $set: {
              solved: true,
            },
          }
        )
      } else {
        await ReportedProblems.updateOne(
          {
            _id: problemExists._id,
          },
          {
            $set: {
              solved: false,
            },
          }
        )
      }

      const solvedProblem = await ReportedProblems.findById(problemExists._id)

      return {
        code: 200,
        success: true,
        message: `Problem marked as ${
          solvedProblem.solved ? "solved" : "unsolved"
        } successfully`,
        reported_problem: problemData(solvedProblem),
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async UpdateUserAvatar(_, { user_id, avatar }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)

      if (!avatar) throw new ApolloError("Avatar is required", 400)

      const user = await User.findById(ctx.user.user_id)

      const { error, fileName } = await uploadOneFile(avatar, "image")

      if (error) throw new ApolloError(error, 400)

      await User.updateOne(
        { _id: ctx.user.user_id },
        {
          $set: {
            avatar: fileName,
          },
        }
      )

      if (user.avatar !== "") deleteUploadedFile(user.avatar)

      const updatedUser = await User.findById(ctx.user.user_id)
      const accessToken = await generateAccessToken(updatedUser)

      return {
        code: 200,
        success: true,
        message: "Avatar updated successfully",
        accessToken,
        user: userData(updatedUser),
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async UpdateUserCredentials(_, { inputs }, ctx, ___) {
    try {
      const {
        user_id,
        name,
        user_name,
        phone,
        whatsapp,
        email,
        password = "",
        old_password,
      } = inputs

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)

      const userExists = await User.findById(ctx.user.user_id)

      const { error } = await registerUserValidation({
        name,
        email,
        phone,
        user_name,
        whatsapp,
        password: password !== "" ? password : "1234567",
        confirm_password: password !== "" ? password : "1234567",
      })
      if (error) throw new ApolloError(error, 400)

      if (user_name.toLowerCase() !== userExists.user_name) {
        const userNameExists = await User.findOne({
          user_name: user_name.toLowerCase(),
        })

        if (userNameExists) throw new ApolloError("Username not available", 400)
      }

      if (phone !== userExists.phone) {
        const phoneExists = await User.findOne({
          phone,
        })
        if (phoneExists)
          throw new ApolloError("Phone number is already registered", 400)
      }

      if (whatsapp !== userExists.whatsapp) {
        const whatsappExists = await User.findOne({
          whatsapp,
        })
        if (whatsappExists)
          throw new ApolloError("Whatsapp number is already registered", 400)
      }

      if (email !== userExists.email) {
        const emailExists = await User.findOne({
          email,
        })
        if (emailExists)
          throw new ApolloError("Email is already registered", 400)
      }

      const passwordMatch = await bcrypt.compare(
        old_password,
        userExists.password
      )
      if (!passwordMatch) throw new ApolloError("Incorrect password", 400)

      const salt = await bcrypt.genSalt(10)
      const newHashedPassword = await bcrypt.hash(password, salt)

      await User.updateOne(
        { _id: userExists._id },
        {
          $set: {
            name,
            email,
            user_name,
            whatsapp,
            phone,
            password: password !== "" ? newHashedPassword : userExists.password,
          },
        }
      )

      const updatedUser = await User.findById(userExists._id)
      const accessToken = await generateAccessToken(updatedUser)

      return {
        code: 200,
        success: true,
        message: "Credentials updated successfully",
        accessToken,
        user: userData(updatedUser),
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async VerifyAccount(_, { user_id, verification_code = "" }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)

      if (!verification_code || verification_code.length < 6)
        throw new ApolloError("Verification code has six characters", 400)

      const user = await User.findOne({ _id: user_id })

      if (
        user.verification_code === "" &&
        process.env.NODE_ENV === "production"
      )
        throw new ApolloError(
          "Request aborted :=> no verification code set",
          400
        )

      if (
        (process.env.NODE_ENV === "production" &&
          user.verification_code !== verification_code) ||
        (process.env.NODE_ENV === "development" &&
          verification_code !== "101010")
      )
        throw new ApolloError("Incorrect verification code", 400)

      if (
        (process.env.NODE_ENV === "development" &&
          verification_code === "101010") ||
        (process.env.NODE_ENV === "production" &&
          verification_code === user.verification_code)
      ) {
        await User.updateOne(
          { _id: user_id },
          {
            $set: {
              verified: true,
              verification_code: "",
            },
          }
        )
      }

      return {
        code: 200,
        success: true,
        message: "Account verified successfully",
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async RequestNewVerificationCode(_, { user_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)

      if (process.env.NODE_ENV !== "production")
        throw new ApolloError(
          "This operation is only allowed in production",
          400
        )

      const user = await User.findOne({ _id: user_id })
      if (user.verified)
        throw new ApolloError(`${user.email} account is already verified`)

      let generatedCode = getRandomNumber(100000, 999999)

      const transport = mailTransporter({
        hostUser: process.env.HOST_EMAIL,
        hostUserPassword: process.env.HOST_EMAIL_PASSWORD,
        to: [user.email],
        subject: "Welcome to your Wiitify account",
        bodyText: `${generatedCode} is your account verification code.`,
      })

      const update = User.updateOne(
        { _id: user._id },
        {
          $set: {
            verification_code: generatedCode,
          },
        }
      )

      await Promise.all([transport, update])

      return {
        code: 200,
        success: true,
        message: `Verification code sent to ${user.email} successfully`,
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async MarkNotificationAsRead(_, { user_id, notification_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)

      if (!notification_id || notification_id.length < 5)
        throw new ApolloError(
          "Notification Id [notification_id] is required",
          400
        )

      const notificationExist = await Notification.findById(notification_id)
      if (!notificationExist)
        throw new ApolloError("Notification doesn't exist", 400)

      await Notification.updateOne(
        { _id: notificationExist._id },
        {
          $push: {
            seen_by: user_id,
          },
        }
      )

      return {
        code: 200,
        success: true,
        message: "Notification marked as read successfully",
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async DeleteNotification(_, { user_id, notification_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      if (!notification_id || notification_id.length < 5)
        throw new ApolloError(
          "Notification Id [notification_id] is required",
          400
        )

      const notificationExist = await Notification.findById(notification_id)
      if (!notificationExist)
        throw new ApolloError("Notification doesn't exist", 400)

      if (
        [
          "LIKE",
          "FOLLOW",
          "REQUEST_CC",
          "ACCEPT_CC",
          "INVITE",
          "DECLINE_CC",
          "ACCEPT_CC",
          "REPORT_CONTENT",
          "BLOCK_CONTENT",
        ].includes(notificationExist.notification_type) &&
        notificationExist.specified_user === user_id
      ) {
        await Notification.deleteOne({ _id: notification_id })
      }

      if (
        ["ALL", "BUSINESS", "PROFFESSIONAL"].includes(
          notificationExist.notification_type
        )
      ) {
        if (ctx.user.role === "ADMIN") {
          await Notification.deleteOne({ _id: notification_id })
        } else {
          await Notification.updateOne(
            { _id: notification_id },
            {
              $push: {
                deleted_for: user_id,
              },
            }
          )
        }
      }

      return {
        code: 200,
        success: true,
        message: "Notification deleted successfully",
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async CreateWallet(_, { inputs }, ctx, ___) {
    try {
      const {
        user_id,
        price,
        blogs_to_offer,
        posts_to_offer,
        products_to_offer,
        currency,
        scope,
      } = inputs

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isAdmin(ctx.user)

      if (price === 0) throw new ApolloError("Invalid Price", 400)

      if (!["ALL", "BUSINESS", "PROFFESSIONAL", "PERSONAL"].includes(scope))
        throw new ApolloError("Invalid scope provided")

      const walletExists = await Wallet.findOne({
        $and: [
          { blogs_to_offer },
          { posts_to_offer },
          { products_to_offer },
          { scope },
          { currency },
        ],
      })

      if (walletExists)
        throw new ApolloError("Wallet with these data already exists")

      const newWallet = await new Wallet({
        price,
        blogs_to_offer,
        products_to_offer: ["ALL", "PERSONAL", "PROFFESSIONAL"].includes(scope)
          ? 0
          : products_to_offer,
        posts_to_offer,
        currency,
        scope,
      }).save()

      return {
        code: 200,
        success: true,
        message: "Wallet created successfully",
        wallet: walletData(newWallet),
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async UpdateWallet(_, { inputs }, ctx, ___) {
    try {
      const {
        user_id,
        wallet_id,
        price,
        blogs_to_offer,
        posts_to_offer,
        products_to_offer,
        currency,
        scope,
      } = inputs

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isAdmin(ctx.user)

      if (price === 0) throw new ApolloError("Invalid Price", 400)

      if (!["ALL", "BUSINESS", "PROFFESSIONAL", "PERSONAL"].includes(scope))
        throw new ApolloError("Invalid scope provided")

      const walletExists = await Wallet.findById(wallet_id)
      if (!walletExists) throw new ApolloError("Wallet not found", 400)

      await Wallet.updateOne(
        {
          _id: walletExists._id,
        },
        {
          $set: {
            price,
            blogs_to_offer,
            posts_to_offer,
            products_to_offer: ["ALL", "PERSONAL", "PROFFESSIONAL"].includes(
              scope
            )
              ? 0
              : products_to_offer,
            currency,
            scope,
          },
        }
      )

      const updatedWallet = await Wallet.findOne({ _id: walletExists._id })

      return {
        code: 200,
        success: true,
        message: "Wallet updated successfully",
        wallet: walletData(updatedWallet),
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async DeleteWallet(_, { user_id, wallet_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isAdmin(ctx.user)

      if (!wallet_id || wallet_id.length < 5)
        throw new ApolloError("Wallet ID:=> [wallet_id] is required", 400)

      const walletExists = await Wallet.findOne({ _id: wallet_id })
      if (!walletExists) throw new ApolloError("Wallet not found", 404)

      await Wallet.deleteOne({ _id: walletExists._id })

      return {
        code: 200,
        success: true,
        message: "Wallet deleted successfully",
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async SwitchToProAccount(_, { inputs }, ctx, ___) {
    try {
      const { user_id, wallet_id } = inputs

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      if (ctx.user.role !== "PERSONAL")
        throw new ApolloError("Only personal accounts are allowed", 400)

      if (!wallet_id || wallet_id.length < 5)
        throw new ApolloError("Wallet Id:=> [wallet_id] is required", 400)

      const walletExists = await Wallet.findOne({ _id: wallet_id })
      if (!walletExists) throw new ApolloError("Wallet not found", 404)

      const { errorMessage, generatedTransaction } = await makePayment(
        walletExists,
        user_id
      )
      if (errorMessage) throw new ApolloError(errorMessage, 400)

      await new Transaction({
        service_provider_gen_id: generatedTransaction.id,
        user_id,
        amount_paid: walletExists.price,
        currency_used: walletExists.currency,
        description: "Switching to proffessional account",
        transaction_role: "PAYMENT",
      }).save()

      const uploadScope = await UploadScope.findOne({ user_id })

      await UploadScope.updateOne(
        { _id: uploadScope._id },
        {
          $set: {
            blogs_available:
              +uploadScope.blogs_available + walletExists.blogs_to_offer,
            posts_available:
              +uploadScope.posts_available + walletExists.posts_to_offer,
          },
        }
      )

      await User.updateOne(
        { _id: user_id },
        {
          $set: {
            role: "PROFFESSIONAL",
          },
        }
      )

      const updatedUser = await User.findOne({ _id: user_id })

      const accessToken = await generateAccessToken(updatedUser)

      return {
        code: 200,
        success: true,
        message: "Account switched to Proffessional",
        accessToken,
        user: userData(updatedUser),
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async UpdateUserLocation(_, { inputs }, ctx, ___) {
    try {
      const {
        user_id,
        province,
        district,
        market_description = "",
        latitude = "",
        longitude = "",
      } = inputs

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isPayingUser(ctx.user)

      if (province.length < 3 || district.length < 3)
        throw new ApolloError(
          "Province and sector must have at least 3 characters",
          400
        )

      const userLocationExists = await Location.findOne({ user_id })
      if (!userLocationExists) {
        await new Location({
          user_id,
          province,
          district,
          market_description,
          latitude,
          longitude,
        }).save()
      } else {
        await Location.updateOne(
          { user_id },
          {
            $set: {
              province,
              district,
              market_description,
              latitude,
              longitude,
            },
          }
        )
      }

      const updatedUser = await User.findOne({ _id: user_id })

      const accessToken = await generateAccessToken(updatedUser)

      return {
        code: 200,
        success: true,
        message: "User Location updated successfully",
        accessToken,
        user: userData(updatedUser),
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async SwitchToBusinessAccount(_, { inputs }, ctx, ___) {
    try {
      const {
        user_id,
        receptient_id,
        blogs_to_offer = 0,
        posts_to_offer = 0,
        products_to_offer = 0,
        province,
        district,
        market_description,
        latitude = "",
        longitude = "",
      } = inputs

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isAdmin(ctx.user)

      if (!receptient_id || receptient_id.length < 5)
        throw new ApolloError("Receptient Id:=> receptient_id is required", 400)

      const receptientExists = await User.findOne({ _id: receptient_id })
      if (!receptientExists)
        throw new ApolloError("Receptient doesn't exist", 404)

      if (receptientExists.role === "BUSINESS")
        throw new ApolloError("Account is already a Business account", 400)

      if (province.length < 3 || district.length < 3)
        throw new ApolloError(
          "Province and sector must have at least 3 characters",
          400
        )

      await new Location({
        user_id: receptient_id,
        province,
        district,
        market_description,
        latitude,
        longitude,
      }).save()

      const userScope = await UploadScope.findOne({ user_id: receptient_id })
      await UploadScope.updateOne(
        { user_id: receptient_id },
        {
          $set: {
            blogs_available: +userScope.blogs_available + blogs_to_offer,
            posts_available: +userScope.posts_available + posts_to_offer,
            products_available:
              +userScope.products_available + products_to_offer,
          },
        }
      )

      await User.updateOne(
        { _id: receptientExists._id },
        {
          $set: {
            role: "BUSINESS",
          },
        }
      )

      const updatedUser = await User.findOne({ _id: receptientExists._id })

      const accessToken = await generateAccessToken(updatedUser)

      return {
        code: 200,
        success: true,
        message: "Account switched to business successfully",
        accessToken,
        user: userData(updatedUser),
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async BoostResources(_, { user_id, wallet_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isPayingUser(ctx.user)

      if (ctx.user.role === "ADMIN") {
        await UploadScope.updateOne(
          { user_id },
          {
            $set: {
              blogs_available: 100,
              posts_available: 100,
              products_available: 100,
            },
          }
        )
      } else {
        if (!wallet_id || wallet_id.length < 5)
          throw new ApolloError("Wallet Id:=> wallet_id is required", 400)

        const walletExists = await Wallet.findOne({ _id: wallet_id })
        if (!walletExists) throw new ApolloError("Wallet not found", 404)

        const { errorMessage, generatedTransaction } = await makePayment(
          walletExists,
          user_id
        )
        if (errorMessage) throw new ApolloError(errorMessage, 400)

        await new Transaction({
          service_provider_gen_id: generatedTransaction.id,
          user_id,
          amount_paid: walletExists.price,
          currency_used: walletExists.currency,
          description: "Boosting resources",
          transaction_role: "PAYMENT",
        }).save()

        const uploadScope = await UploadScope.findOne({ user_id })

        await UploadScope.updateOne(
          { _id: uploadScope._id },
          {
            $set: {
              blogs_available:
                +uploadScope.blogs_available + walletExists.blogs_to_offer,
              posts_available:
                +uploadScope.posts_available + walletExists.posts_to_offer,
            },
          }
        )
      }

      const updatedUser = await User.findOne({ _id: user_id })

      const accessToken = await generateAccessToken(updatedUser)

      return {
        code: 200,
        success: true,
        message: "Resources boosted successfully",
        accessToken,
        user: userData(updatedUser),
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async ReportContent(_, { inputs }, ctx, ___) {
    try {
      const { user_id, content_id, problem } = inputs

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      if (!content_id || content_id.length < 5)
        throw new ApolloError("Content Id:=> content_id is required", 400)

      if (!problem || problem.length < 5)
        throw new ApolloError("Problem must be more descriptive", 400)

      const pr1 = Blog.findOne({ _id: content_id })
      const pr2 = Post.findOne({ _id: content_id })
      const pr3 = Product.findOne({ _id: content_id })

      const [isBlog, isPost, isProduct] = await Promise.all([pr1, pr2, pr3])

      if (!isBlog && !isPost && !isProduct)
        throw new ApolloError("Reported content doesn't exist", 404)

      let contentFound = null

      if (isBlog) contentFound = isBlog
      if (isPost) contentFound = isPost
      if (isProduct) contentFound = isProduct

      const newReportedContent = await new ReportedContent({
        user_id,
        content_id: contentFound._id.toString(),
        problem,
      }).save()

      const allAdmins = await User.find({ role: "ADMIN" })
      for (let admin of allAdmins) {
        await new Notification({
          notification_type: "REPORT_CONTENT",
          ref_object: newReportedContent._id.toString(),
          specified_user: admin._id.toString(),
          body: "You have new reported content",
        }).save()
      }

      return {
        code: 200,
        success: true,
        message: "Content problem reported successfully",
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async BlockReportedContent(_, { user_id, reported_content_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isAdmin(ctx.user)

      if (!reported_content_id || reported_content_id.length < 5)
        throw new ApolloError("Content Id:=> content_id is required", 400)

      const reportedContentExists = await ReportedContent.findOne({
        _id: reported_content_id,
      })
      if (!reportedContentExists)
        throw new ApolloError("Reported content not found", 404)

      const pr1 = Blog.findOne({ _id: reportedContentExists.content_id })
      const pr2 = Post.findOne({ _id: reportedContentExists.content_id })
      const pr3 = Product.findOne({ _id: reportedContentExists.content_id })

      const [isBlog, isPost, isProduct] = await Promise.all([pr1, pr2, pr3])

      if (!isBlog && !isPost && !isProduct)
        throw new ApolloError("The content doesn't exist", 404)

      let contentFound = null

      if (isBlog) {
        contentFound = isBlog
        await Blog.updateOne(
          { _id: isBlog._id },
          {
            $set: {
              blocked: true,
            },
          }
        )
      }

      if (isPost) {
        contentFound = isPost
        await Post.updateOne(
          { _id: isPost._id },
          {
            $set: {
              blocked: true,
            },
          }
        )
      }

      if (isProduct) {
        contentFound = isProduct
        await Product.updateOne(
          { _id: isProduct._id },
          {
            $set: {
              blocked: true,
            },
          }
        )
      }

      await new Notification({
        notification_type: "BLOCK_CONTENT",
        ref_object: contentFound._id.toString(),
        specified_user: contentFound.user_id,
        body: `Your item have been blocked due to inapropriate content`,
      }).save()

      return {
        code: 200,
        success: true,
        message: "Content has been blocked successfully",
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async RequestPostBlogPrizes(_, { user_id }, ctx, ___) {
    try {
      const numberOfFollowerPrizes = Number(
        process.env.NUMBER_OF_FOLLOWER_PRIZES
      )

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      let postPrizeViews = Number(process.env.POST_PRIZE_VIEWS)
      let postPrizeLikes = Number(process.env.POST_PRIZE_LIKES)
      let postPrizeShares = Number(process.env.POST_PRIZE_SHARES)
      let blogPrizeLikes = Number(process.env.BLOG_PRIZE_LIKES)
      let blogPrizeShares = Number(process.env.BLOG_PRIZE_SHARES)
      let prizeAmount = Number(process.env.POST_BLOG_PRIZE_AMOUNT_IN_FRW)

      if (!["PROFFESSIONAL", "BUSINESS"].includes(ctx.user.role))
        throw new ApolloError(
          "Only proffessional and business accounts can request post prizes",
          401
        )

      const userFollowers = await Following.find({
        $or: [
          { user_id },
          {
            $and: [
              {
                follower_id: user_id,
              },
              { accepted: true },
            ],
          },
        ],
      })
      if (userFollowers.length < numberOfFollowerPrizes)
        throw new ApolloError(
          `You must have at least ${numberOfFollowerPrizes} followers`,
          400
        )

      const userBlogs = await Blog.find({
        $and: [{ user_id }, { prized: false }],
      })
      const userPosts = await Post.find({
        $and: [{ user_id }, { prized: false }],
      })

      for (let blog of userBlogs) {
        const blogLikeEvents = await Event.find({
          $and: [{ parent_id: blog._id.toString() }, { event_type: "LIKE" }],
        })
        const blogShareEvents = await Event.find({
          $and: [{ parent_id: blog._id.toString() }, { event_type: "SHARE" }],
        })

        if (
          blogLikeEvents.length >= blogPrizeLikes &&
          blogShareEvents.length >= blogPrizeShares
        ) {
          blogPrizeLikes = blogPrizeLikes === 0 ? 0.01 : blogPrizeLikes
          blogPrizeShares = blogPrizeShares === 0 ? 0.01 : blogPrizeShares

          let blogLikeFraction = blogLikeEvents.length / (blogPrizeLikes * 10)
          let blogShareFraction =
            blogShareEvents.length / (blogPrizeShares * 10)
          let blogPrizeFraction = blogLikeFraction + blogShareFraction

          await new Prize({
            user_id,
            prize_event: "BLOG_PRIZE",
            prize_amount: prizeAmount + prizeAmount * blogPrizeFraction,
            prize_amount_currency: "FRW",
          }).save()

          await Blog.updateOne(
            { _id: blog._id },
            {
              $set: {
                prized: true,
              },
            }
          )
        } else continue
      }

      for (let post of userPosts) {
        const postLikeEvents = await Event.find({
          $and: [{ parent_id: post._id.toString() }, { event_type: "LIKE" }],
        })
        const postViewEvents = await Event.find({
          $and: [{ parent_id: post._id.toString() }, { event_type: "VIEW" }],
        })
        const postShareEvents = await Event.find({
          $and: [{ parent_id: post._id.toString() }, { event_type: "SHARE" }],
        })

        if (
          postLikeEvents.length >= postPrizeLikes &&
          (postViewEvents.length >= postPrizeViews ||
            postShareEvents.length >= postPrizeShares)
        ) {
          postPrizeLikes = postPrizeLikes === 0 ? 0.01 : postPrizeLikes
          postPrizeShares = postPrizeShares === 0 ? 0.01 : postPrizeShares

          let postLikeFraction = postLikeEvents.length / (postPrizeLikes * 10)
          let postViewAndShareFraction =
            postViewEvents.length > postShareEvents.length
              ? postViewEvents.length / (postPrizeViews * 20)
              : postShareEvents.length / (postPrizeShares * 8)
          let postPrizeFraction = postLikeFraction + postViewAndShareFraction

          await new Prize({
            user_id,
            prize_event: "POST_PRIZE",
            prize_amount: prizeAmount + prizeAmount * postPrizeFraction,
            prize_amount_currency: "FRW",
          }).save()

          await Post.updateOne(
            { _id: post._id.toString() },
            {
              $set: {
                prized: true,
              },
            }
          )
        } else continue
      }

      const allPrizes = await Prize.find({ user_id }).sort({ _id: -1 })

      return {
        code: 200,
        success: true,
        message: "Prizes set successfully",
        prizes: allPrizes.map((prize) => prizeData(prize)),
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async ShareContent(_, { inputs }, ctx, ___) {
    try {
      const { user_id, content_id, share_to = [] } = inputs

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      if (!content_id || content_id.length < 5)
        throw new ApolloError("Content Id:=> content_id is required", 400)

      if (share_to.length < 1)
        throw new ApolloError("Receptients are required", 400)

      if (share_to.includes(user_id))
        throw new ApolloError("You can not share item to yourself", 400)

      const pr1 = Blog.findOne({ _id: content_id })
      const pr2 = Post.findOne({ _id: content_id })
      const pr3 = Product.findOne({ _id: content_id })

      const [isBlog, isPost, isProduct] = await Promise.all([pr1, pr2, pr3])

      if (!isBlog && !isPost && !isProduct)
        throw new ApolloError("Reported content doesn't exist", 404)

      let contentFound = null
      let contentType = ""

      if (isBlog) {
        contentFound = isBlog
        contentType = "BLOG"
      }
      if (isPost) {
        contentFound = isPost
        contentType = "POST"
      }
      if (isProduct) {
        contentFound = isProduct
        contentType = "PRODUCT"
      }

      const { tagError, validTaggedUsers } = await verifyTaggedUsers(share_to)
      if (tagError) throw new ApolloError(tagError, 400)

      await new Event({
        user_id,
        parent_id: contentFound?._id,
        event_type: "SHARE",
      }).save()

      for (let taggedUser of validTaggedUsers) {
        await new Message({
          from: user_id,
          to: taggedUser,
          text: `You have been shared with this ${contentType.toLowerCase()}`,
          refer_type: contentType,
          refer_item: contentFound?._id.toString(),
        }).save()
      }

      return {
        code: 200,
        success: true,
        message: `${contentType.toLowerCase()} shared successfully`,
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async RequestPrizePayment(_, { user_id, prize_id }, ctx, ___) {
    try {
      const numberOfProductPrizes = Number(process.env.NUMBER_OF_PRODUCT_PRIZES)

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      if (!prize_id || prize_id?.length < 1)
        throw new ApolloError("Prize id:=> prize_id is required", 400)

      const prizeExists = await Prize.findOne({
        $and: [{ user_id }, { _id: prize_id }],
      })
      if (!prizeExists) throw new ApolloError("Requested prize not found", 404)

      const productPrizes = await Prize.find({
        $and: [{ user_id }, { prize_event: "ACCEPT_CC" }],
      })
      if (
        prizeExists.prize_event === "ACCEPT_CC" &&
        productPrizes.length < numberOfProductPrizes
      )
        throw new ApolloError(
          `You must have at least ${numberOfProductPrizes} product prizes to get prized for accepted coin-code product`,
          400
        )

      const { errorMessage, generatedTransaction } = await offerPayment(
        {
          amount: prizeExists.prize_amount - prizeExists.prize_amount * 0.1,
          currency: prizeExists.prize_amount_currency,
        },
        user_id
      )
      if (errorMessage) throw new ApolloError(errorMessage, 400)

      await new Transaction({
        service_provider_gen_id: generatedTransaction.id,
        user_id,
        amount_paid: prizeExists.prize_amount - prizeExists.prize_amount * 0.1,
        currency_used: prizeExists.prize_amount_currency,
        description: "Receiving the prize",
        transaction_role: "PRIZING",
      }).save()

      await Prize.updateOne(
        { user_id },
        {
          $set: {
            prized: true,
          },
        }
      )

      return {
        code: 200,
        success: true,
        message: "Prize set and paid successfully",
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async ArchiveAccount(_, { user_id }, ctx, ___) {
    try {
      let toDay = new Date()

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      if (ctx.user.role === "ADMIN")
        throw new ApolloError("Account can't be archived", 401)

      await new ArchivedAccount({
        user_id,
        deleteAt: toDay.setMonth(toDay.getMonth() + 1),
      }).save()

      await User.updateOne(
        { _id: user_id },
        {
          $set: {
            archived: true,
          },
        }
      )

      return {
        code: 200,
        success: true,
        message: "Unless you login, the account will be deleted after 1 month",
      }
    } catch (err) {
      generateServerError(err)
    }
  },
}

module.exports = userMutations
