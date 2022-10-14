const bcrypt = require("bcryptjs")
const { ApolloError } = require("apollo-server-errors")

const User = require("../../models/User")
const UploadScope = require("../../models/UploadScope")
const {
  registerUserValidation,
  loginUserValidation,
} = require("../../validators")
const { userData, generateAccessToken } = require("../../helpers/userHelpers")
const { uploadOneFile } = require("../../helpers/uploadHelpers")
const { generateServerError } = require("../../helpers/errorHelpers")
const ReportedProblems = require("../../models/ReportedProblems")
const {
  isAdmin,
  isAuthenticated,
  isAccountVerified,
  isValidUser,
} = require("../shield")
const { problemData } = require("../../helpers/problemHelpers")

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
}

module.exports = userMutations
