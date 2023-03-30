const { ApolloError } = require("apollo-server-errors")

const Post = require("../../models/Post")
const UploadScope = require("../../models/UploadScope")
const Notification = require("../../models/Notification")
const Message = require("../../models/Message")
const Event = require("../../models/Event")
const Comment = require("../../models/Comment")
const ReportedContent = require("../../models/ReportedContent")
const {
  isAuthenticated,
  isAccountVerified,
  isPayingUser,
  isValidUser,
} = require("../shield")
const {
  uploadManyFiles,
  deleteUploadedFile,
} = require("../../helpers/uploadHelpers")
const { postData } = require("../../helpers/postHelpers")
const { verifyTaggedUsers } = require("../../helpers/tagHelpers")
const { generateServerError } = require("../../helpers/errorHelpers")

const postMutations = {
  async UploadPost(_, { inputs, postMedia = [] }, ctx, ___) {
    try {
      const { user_id, description, tagged_users = [] } = inputs

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isPayingUser(ctx.user)

      const userScope = await UploadScope.findOne({ user_id })
      if (userScope.posts_available === 0)
        throw new ApolloError("Post upload limit reached", 400)

      if (postMedia?.length === 0)
        throw new ApolloError("Images or videos for the post are required", 400)

      if (description.length === 0)
        throw new ApolloError("Description is required", 400)

      if (tagged_users.length > 0 && tagged_users.includes(user_id))
        throw new ApolloError("You can not tag to your own post", 400)

      const { tagError, validTaggedUsers } = await verifyTaggedUsers(
        tagged_users
      )
      if (tagError) throw new ApolloError(tagError, 400)

      const { error, uploadedFiles } = await uploadManyFiles(postMedia)
      if (error) throw new ApolloError(error, 400)

      let validUploadedPostFiles = []
      for (let file of uploadedFiles) {
        validUploadedPostFiles.push({
          file_format: file.fileFormat,
          file_name: file.fileName,
        })
      }

      const newPost = await new Post({
        user_id,
        description: description ? description : "",
        tagged_users: validTaggedUsers.length > 0 ? validTaggedUsers : [],
        post_media: validUploadedPostFiles,
      }).save()

      await UploadScope.updateOne(
        { _id: userScope._id },
        {
          $set: {
            posts_available: +userScope.posts_available - 1,
          },
        }
      )

      if (validTaggedUsers.length > 0) {
        for (let tagged_user of validTaggedUsers) {
          await new Notification({
            notification_type: "INVITE",
            ref_object: newPost._id.toString(),
            specified_user: tagged_user,
            body: "You have new post suggestion",
          }).save()
        }
      }

      return {
        code: 201,
        success: true,
        message: "Post uploaded successfully",
        post: postData(newPost),
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async DeletePost(_, { user_id, post_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isPayingUser(ctx.user)

      if (!post_id) throw new ApolloError("Post_id is required", 400)

      const postExist = await Post.findOne({ _id: post_id })
      if (!postExist) throw new ApolloError("Post doesn't exist", 400)

      for (let post_media of postExist.post_media) {
        deleteUploadedFile(post_media.file_name)
      }

      //* Deleting comment replies for the post
      const postComments = await Comment.find({ to: postExist._id.toString() })
      for (let postComment of postComments) {
        await Comment.deleteMany({ to: postComment._id.toString() })
        await Event.deleteMany({ parent_id: postComment._id.toString() })
      }

      //* Deleting all notifications related to post reports
      const allReports = await ReportedContent.find({
        content_id: postExist._id.toString(),
      })
      for (let report of allReports) {
        await Notification.deleteMany({ ref_object: report._id.toString() })
      }

      const pr1 = Post.deleteOne({ _id: postExist._id })
      const pr2 = Notification.deleteMany({
        ref_object: postExist._id.toString(),
      })
      const pr3 = Message.deleteMany({ refer_item: postExist._id.toString() })
      const pr4 = Event.deleteMany({ parent_id: postExist._id.toString() })
      const pr5 = ReportedContent.deleteMany({
        content_id: postExist._id.toString(),
      })
      const pr6 = Comment.deleteMany({ to: postExist._id.toString() })

      await Promise.all([pr1, pr2, pr3, pr4, pr5, pr6])

      return {
        code: 200,
        success: true,
        message: "Post deleted successfully",
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async UpdatePostText(_, { inputs }, ctx, ___) {
    try {
      const { user_id, post_id, description } = inputs

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isPayingUser(ctx.user)

      const postExist = await Post.findOne({
        $and: [{ _id: post_id }, { user_id }],
      })
      if (!postExist) throw new ApolloError("Post doesn't exist", 400)

      if (description.length === 0)
        throw new ApolloError("Description is required", 400)

      if (
        postExist.createdAt.toISOString() !== postExist.updatedAt.toISOString()
      )
        throw new ApolloError("Post data can be updated only once", 401)

      await Post.updateOne(
        { _id: postExist._id },
        {
          $set: {
            description,
          },
        }
      )

      const updatedPost = await Post.findById(postExist._id)

      return {
        code: 200,
        success: true,
        message: "Post updated successfully",
        post: postData(updatedPost),
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async UpdatePostMedia(_, { inputs, postMedia }, ctx, ___) {
    try {
      const { user_id, post_id } = inputs

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isPayingUser(ctx.user)

      const postExist = await Post.findOne({
        $and: [{ _id: post_id }, { user_id }],
      })
      if (!postExist) throw new ApolloError("Post doesn't exist", 400)

      if (
        postExist.createdAt.toISOString() !== postExist.updatedAt.toISOString()
      )
        throw new ApolloError("Post data can be updated only once", 401)

      const { error, uploadedFiles } = await uploadManyFiles(postMedia)
      if (error) throw new ApolloError(error, 400)

      await Post.updateOne(
        { _id: postExist._id },
        {
          $set: {
            post_media: uploadedFiles.map((file) => ({
              file_name: file.fileName,
              file_format: file.fileFormat,
            })),
          },
        }
      )

      for (let file of postExist.post_media) {
        deleteUploadedFile(file.file_name)
      }

      const updatedPost = await Post.findById(postExist._id)

      return {
        code: 200,
        success: true,
        message: "Post updated successfully",
        post: postData(updatedPost),
      }
    } catch (err) {
      generateServerError(err)
    }
  },
}

module.exports = postMutations
