const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { ApolloError } = require("apollo-server-errors")

const User = require("../../models/User")
const {
  registerUserValidation,
  loginUserValidation,
} = require("../../validators/userValidator")
const { userData } = require("../../helpers/userHelpers")

const userMutations = {
  async RegisterUser(_, args, __, ___) {
    try {
      const data = args.inputs

      const { error } = registerUserValidation(data)
      if (error) return new ApolloError(error, 400)

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

      if (pr1) return new ApolloError("Username is not available", 400)
      if (pr2) return new ApolloError("Phone number is already registered", 400)
      if (pr3)
        return new ApolloError("Whatsapp number is already registered", 400)
      if (pr4) return new ApolloError("Email is already registered", 400)

      /* Upload functionality will be added here */

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(data.password, salt)

      const newUser = await new User({
        ...data,
        password: hashedPassword,
      }).save()

      /* Send verification code to whatsapp and Generate the 
      notification to the user to verify his/her account */

      const accessToken = await jwt.sign(
        {
          user_id: newUser._id.toString(),
        },
        process.env.ACCESS_SECRET,
        {
          expiresIn: "7d",
        }
      )

      return {
        code: 201,
        success: true,
        message: "User registered successfully",
        accessToken,
        user: userData(newUser),
      }
    } catch (err) {
      console.error(err)
      throw new ApolloError(err.message, 500)
    }
  },
  async LoginUser(_, args, __, ___) {
    try {
      const { credential, password } = args

      const { error } = loginUserValidation({ credential, password })
      if (error) return new ApolloError(error, 400)

      const userExists = await User.findOne({
        $or: [
          { user_name: credential },
          { phone: credential },
          { email: credential },
          { whatsapp: credential },
        ],
      })
      if (!userExists) return new ApolloError("User doesn't exist", 400)

      const passwordMatch = await bcrypt.compare(password, userExists.password)
      if (!passwordMatch) return new ApolloError("Incorrect password", 400)

      const accessToken = await jwt.sign(
        {
          user_id: userExists._id.toString(),
        },
        process.env.ACCESS_SECRET,
        {
          expiresIn: "7d",
        }
      )

      return {
        code: 200,
        success: true,
        message: "User logged in successfully",
        accessToken,
        user: userData(userExists),
      }
    } catch (err) {
      console.error(err)
      throw new ApolloError(err.message, 500)
    }
  },
}

module.exports = userMutations
