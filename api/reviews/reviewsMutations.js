const { ApolloError } = require("apollo-server-errors")

const Reviews = require("../../models/Reviews")
const User = require("../../models/User")
const { addReviewValidation } = require("../../validators")
const { reviewData } = require("../../helpers/reviewHelpers")
const { isValidUser, isAuthenticated } = require("../shield")

const reviewMutations = {
  async SendReview(_, { inputs }, ctx, ___) {
    try {
      const { from, to } = inputs
      isAuthenticated(ctx)
      isValidUser(ctx.user, from)

      const { error } = await addReviewValidation(inputs)
      if (error) throw new ApolloError(error, 400)

      const receiverExists = await User.findById(to)
      if (!receiverExists)
        throw new ApolloError("Receiver of the review doesnot exist")

      if (from === to)
        throw new ApolloError(
          "User can't send a review to his or her own account",
          400
        )

      const reviewExists = await Reviews.findOne({
        $and: [{ from }, { to }],
      })
      if (reviewExists)
        throw new ApolloError("Only one review is accepted for the user", 400)

      const newReview = await new Reviews({ ...inputs }).save()
      return {
        code: 201,
        success: true,
        message: "A review was sent successfully",
        review: reviewData(newReview),
      }
    } catch (err) {
      throw new ApolloError(err.message, err.extensions.code)
    }
  },
}

module.exports = reviewMutations
