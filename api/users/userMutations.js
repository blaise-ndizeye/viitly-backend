const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { ApolloError } = require("apollo-server-errors")

const User = require("../../models/User")
const {
  registerUserValidation,
  loginUserValidation,
} = require("../../validators")
const { userData } = require("../../helpers/userHelpers")
const {
  uploadOneFile,
  uploadManyFiles,
  deleteUploadedFile,
} = require("../../helpers/uploadHelpers")

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
      throw new ApolloError(err.message, err.extensions.code)
    }
  },
  async LoginUser(_, args, __, ___) {
    try {
      const { credential, password } = args

      const { error } = await loginUserValidation({ credential, password })
      if (error) throw new ApolloError(error, 400)

      const userExists = await User.findOne({
        $or: [
          { user_name: credential },
          { phone: credential.substring(1) },
          { email: credential },
          { whatsapp: credential.substring(1) },
        ],
      })
      if (!userExists) throw new ApolloError("User doesn't exist", 400)

      const passwordMatch = await bcrypt.compare(password, userExists.password)
      if (!passwordMatch) throw new ApolloError("Incorrect password", 400)

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
      throw new ApolloError(err.message, err.extensions.code)
    }
  },
  async TestUpload(_, { file }, __, ___) {
    try {
      const { error, fileName, fileFormat } = await uploadOneFile(file, "video")
      if (error) throw new ApolloError(error, 400)
      return {
        fileName: `${process.env.BASE_URL}/${fileName}`,
        fileFormat,
      }
    } catch (err) {
      throw new ApolloError(err.message, err.extensions.code)
    }
  },
  async TestMultipleUpload(_, { files }) {
    try {
      if (files?.length === 0) return []

      const { error, uploadedFiles } = await uploadManyFiles(files)
      if (error) throw new ApolloError(error, 400)

      return uploadedFiles.map((file) => ({
        fileName: `${process.env.BASE_URL}/${file.fileName}`,
        fileFormat: file.fileFormat,
      }))
    } catch (err) {
      throw new ApolloError(err.message, err.extensions.code)
    }
  },
  async DeleteFile(_, { fileName }) {
    try {
      await deleteUploadedFile(fileName)
      return "File deleted"
    } catch (err) {
      throw new ApolloError(err.message, 500 || err?.extensions.code)
    }
  },
}

module.exports = userMutations
