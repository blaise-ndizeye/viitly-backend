const { ApolloError } = require("apollo-server-errors")

const { generateServerError } = require("../../helpers/errorHelpers")
const {
  //isAdmin,
  isAuthenticated,
  isAccountVerified,
  isValidUser,
} = require("../shield")
const Event = require("../../models/Event")
const Blog = require("../../models/Blog")
const Post = require("../../models/Post")
const Product = require("../../models/Product")
const Comment = require("../../models/Comment")
const Notification = require("../../models/Notification")

async function getParentObject(obj_id) {
  let parentFound = null

  const pr1 = Blog.findOne({ _id: obj_id })
  const pr2 = Post.findOne({ _id: obj_id })
  const pr3 = Product.findOne({ _id: obj_id })
  const pr4 = Comment.findOne({ _id: obj_id })

  const [eventFound, blogFound, postFound, productFound, commentFound] =
    await Promise.all([pr1, pr2, pr3, pr4])

  if (
    !eventFound &&
    !blogFound &&
    !postFound &&
    !productFound &&
    !commentFound
  ) {
    return {
      error: "No parent object found",
      parentObj: null,
    }
  }

  if (eventFound) parentFound = eventFound
  if (blogFound) parentFound = blogFound
  if (postFound) parentFound = postFound
  if (productFound) parentFound = productFound
  if (commentFound) parentFound = commentFound

  return {
    error: "",
    parentObj: parentFound,
  }
}

const eventMutations = {
  async CommitEvent(_, { inputs }, ctx, ___) {
    try {
      const { user_id, parent_id = "", event_type } = inputs

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)

      if (parent_id.length < 5)
        throw new ApolloError("Parent Id :=> [parent_id] is required")

      const { error, parentObj } = await getParentObject(parent_id)
      if (error) throw new ApolloError(error, 400)

      switch (event_type) {
        case "SHARE":
        case "VIEW":
        case "LIKE":
          const eventExists = await Event.findOne({
            user_id,
            parent_id: parentObj?._id,
            event_type,
          })
          if (eventExists)
            throw new ApolloError("Event has been already set", 400)

          if (
            parentObj?.body !== "" &&
            (event_type === "VIEW" || event_type === "SHARE")
          )
            throw new ApolloError(
              "LIKE events are only allowed for comments",
              400
            )
          await new Event({
            user_id,
            parent_id: parentObj?._id,
            event_type,
          }).save()
          if (event_type === "LIKE") {
            await new Notification({
              notification_type: "LIKE",
              ref_object: parentObj._id.toString(),
              specified_user: parentObj?.role
                ? parentObj._id.toString()
                : parentObj.user_id,
              body: "You have gained a new like",
            }).save()
          }
          break
        case "DISLIKE":
          await Event.deleteOne({
            $and: [
              { user_id },
              { parent_id: parentObj?._id },
              { event_type: "LIKE" },
            ],
          })
          break
        default:
          throw new ApolloError("Invalid event", 400)
      }

      return {
        code: 200,
        success: true,
        message: `${event_type} set successfully`,
      }
    } catch (err) {
      generateServerError(err)
    }
  },
}

module.exports = eventMutations
