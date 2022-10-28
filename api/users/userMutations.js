const bcrypt = require("bcryptjs")
const { ApolloError } = require("apollo-server-errors")

const Location = require("../../models/Location")
const User = require("../../models/User")
const UploadScope = require("../../models/UploadScope")
const Notification = require("../../models/Notification")
const ReportedProblems = require("../../models/ReportedProblems")
const Transaction = require("../../models/Transaction")
const Wallet = require("../../models/Wallet")
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
const { makePayment } = require("../../helpers/paymentHelpers")

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

      /* Send verification code to whatsapp and Generate the 
      notification to the user to verify his/her account */
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
      if (!userExists) throw new ApolloError("User doesn't exist", 400)

      const passwordMatch = await bcrypt.compare(password, userExists.password)
      if (!passwordMatch) throw new ApolloError("Incorrect password", 400)

      const accessToken = await generateAccessToken(userExists)

      return {
        code: 200,
        success: true,
        message: "User logged in successfully",
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
        ["LIKE", "FOLLOW", "REQUEST_CC", "ACCEPT_CC", "INVITE"].includes(
          notificationExist.notification_type
        ) &&
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
      const {
        user_id,
        wallet_id,
        province,
        district,
        market_description,
        latitude = "",
        longitude = "",
      } = inputs

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      if (ctx.user.role !== "PERSONAL")
        throw new ApolloError("Only personal accounts are allowed", 400)

      if (!wallet_id || wallet_id.length < 5)
        throw new ApolloError("Wallet Id:=> [wallet_id] is required", 400)

      const walletExists = await Wallet.findOne({ _id: wallet_id })
      if (!walletExists) throw new ApolloError("Wallet not found", 404)

      if (province.length < 3 || district.length < 3)
        throw new ApolloError(
          "Province and sector must have at least 3 characters",
          400
        )

      const { errorMessage, generatedTransaction } = await makePayment(
        walletExists,
        user_id
      )
      if (errorMessage) throw new ApolloError(errorMessage, 400)

      await new Location({
        user_id,
        province,
        district,
        market_description,
        latitude,
        longitude,
      }).save()

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
            blogs_available: +uploadScope.blogs_available + 5,
            posts_available: +uploadScope.posts_available + 4,
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
      } = inputs

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isAdmin(ctx.user)

      const receptientExists = await User.findOne({ _id: receptient_id })
      if (!receptientExists)
        throw new ApolloError("Receptient doesn't exist", 404)

      if (receptientExists.role === "BUSINESS")
        throw new ApolloError("Account is already a Business account", 400)

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
}

module.exports = userMutations
