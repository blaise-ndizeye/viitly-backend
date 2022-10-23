const bcrypt = require("bcryptjs")
const { ApolloError } = require("apollo-server-errors")

const User = require("../../models/User")
const UploadScope = require("../../models/UploadScope")
const Notification = require("../../models/Notification")
const ReportedProblems = require("../../models/ReportedProblems")
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
  isValidUser,
} = require("../shield")
const { problemData } = require("../../helpers/problemHelpers")
const mailTransporter = require("../../utils/mail/send")
const { getRandomNumber } = require("../../helpers/customHelpers")

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
}

module.exports = userMutations
