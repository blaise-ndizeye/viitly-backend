const { ApolloError } = require("apollo-server-errors")

const Following = require("../../models/Following")
const User = require("../../models/User")
const { isAuthenticated, isAccountVerified, isValidUser } = require("../shield")
const { generateServerError } = require("../../helpers/errorHelpers")
const { followData } = require("../../helpers/followHelpers")

const followMutations = {
  async SendFollowRequest(_, { user_id, requested_user_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      if (!requested_user_id || requested_user_id.length < 1)
        throw new ApolloError(
          "Requested User Id => [requested_user_id] is required",
          400
        )
      const requestedUserExist = await User.findById(requested_user_id)
      if (!requestedUserExist)
        throw new ApolloError("Requested User doesn't exist", 400)

      const isAlreadyFollower = await Following.findOne({
        $or: [
          { $and: [{ user_id }, { follower_id: requested_user_id }] },
          {
            $and: [
              { follower_id: user_id },
              { user_id: requested_user_id },
              { accepted: true },
            ],
          },
        ],
      })

      if (isAlreadyFollower !== null && !isAlreadyFollower?.accepted)
        throw new ApolloError(
          `${requestedUserExist.name} has already sent you follow request`,
          400
        )
      if (isAlreadyFollower !== null && isAlreadyFollower?.accepted)
        throw new ApolloError(
          `${requestedUserExist.name} is already your follower`,
          400
        )

      const followRequestExist = await Following.findOne({
        $and: [
          { user_id: requested_user_id },
          { follower_id: user_id },
          { accepted: false },
        ],
      })
      if (followRequestExist !== null && !followRequestExist?.accepted)
        throw new ApolloError(
          `Follow request has been already sent to ${requestedUserExist.name}`,
          400
        )
      if (followRequestExist !== null && followRequestExist?.accepted)
        throw new ApolloError(
          `Follow request has been already accepted by ${requestedUserExist.name}`,
          400
        )

      await new Following({
        user_id: requested_user_id,
        follower_id: user_id,
      }).save()

      await User.updateOne(
        { _id: user_id },
        {
          $set: {
            nFollowings: +ctx.user.nFollowings + 1,
          },
        }
      )

      await User.updateOne(
        { _id: requestedUserExist._id },
        {
          $set: {
            nFollowers: +requestedUserExist.nFollowers + 1,
          },
        }
      )

      return {
        code: 201,
        success: true,
        message: `Follow request sent to ${requestedUserExist.name} successfully`,
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async AcceptFollowRequest(_, { user_id, follower_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      if (!follower_id || follower_id.length < 1)
        throw new ApolloError("Follower Id => [follower_id] is required", 400)

      const followerExist = await User.findById(follower_id)
      if (!followerExist) throw new ApolloError("Follower doesn't exist", 400)

      const followRequestExist = await Following.findOne({
        $and: [{ user_id }, { follower_id }, { accepted: false }],
      })
      if (!followRequestExist)
        throw new ApolloError(
          `Follow request by ${followerExist.name} doesn't exist`,
          400
        )

      await Following.updateOne(
        { _id: followRequestExist._id },
        {
          $set: {
            accepted: true,
          },
        }
      )

      await User.updateOne(
        { _id: followerExist._id },
        {
          $set: {
            nFollowings: followerExist.nFollowings - 1,
            nFollowers: +followerExist.nFollowers + 1,
          },
        }
      )

      return {
        code: 200,
        success: true,
        message: `Follow request for ${followerExist.name} accepted successfully`,
      }
    } catch (err) {
      generateServerError(err)
    }
  },
}

module.exports = followMutations