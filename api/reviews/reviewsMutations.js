const { ApolloError } = require("apollo-server-errors")

const Reviews = require("../../models/Reviews")
const User = require("../../models/User")
const {
  addReviewValidation,
  updateReviewValidation,
} = require("../../validators")
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
        throw new ApolloError("Receiver of the review doesnot exist", 400)

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
      await User.updateOne(
        { _id: receiverExists._id },
        {
          $set: {
            nReviews: +receiverExists.nReviews + 1,
          },
        }
      )
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
  async UpdateReview(_, args, ctx, ___) {
    try {
      const { user_id, review_id, description, rating } = args.inputs

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)

      const { error } = await updateReviewValidation({ description, rating })
      if (error) throw new ApolloError(error, 400)

      const reviewExists = await Reviews.findOne({
        $and: [{ _id: review_id }, { from: user_id }],
      })
      if (!reviewExists)
        throw new ApolloError("Review being updated not found", 400)

      await Reviews.updateOne(
        { _id: reviewExists._id },
        {
          $set: {
            description,
            rating,
          },
        }
      )

      const updatedReview = await Reviews.findOne({ _id: reviewExists._id })

      return {
        code: 200,
        success: true,
        message: "Review updated successfully",
        review: reviewData(updatedReview),
      }
    } catch (err) {
      throw new ApolloError(err.message, err.extensions.code)
    }
  },
}

module.exports = reviewMutations
