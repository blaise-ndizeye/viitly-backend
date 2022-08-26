const jwt = require("jsonwebtoken")
const { ApolloError } = require("apollo-server-errors")

const User = require("../models/User")
const { userData } = require("../helpers/userHelpers")

module.exports = async function (context) {
  try {
    const authorizationHeader = context.req.header("Authorization")
    if (!authorizationHeader) {
      return { user: null, error: "Authorization header is required" }
    }

    const token = authorizationHeader.split(" ")[1]
    if (!token) return { user: null, error: "Token is required" }

    const verifyToken = await jwt.verify(token, process.env.ACCESS_SECRET)
    if (!verifyToken) return { user: null, error: "Invalid Token" }

    const verifiedUser = await User.findById(verifyToken.user_id)
    if (!verifiedUser) return { user: null, error: "Invalid Token credentials" }

    return {
      user: userData(verifiedUser),
      error: "",
    }
  } catch (err) {
    throw new ApolloError(err.message, 500)
  }
}
