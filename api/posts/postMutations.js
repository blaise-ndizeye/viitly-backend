const { ApolloError } = require("apollo-server-errors")

const Post = require("../../models/Post")
const UploadScope = require("../../models/UploadScope")
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

      return {
        code: 201,
        success: true,
        message: "Post uploaded successfully",
        post: postData(newPost),
      }
    } catch (err) {
      throw new ApolloError(err.message, err.extensions.code)
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

      await Post.deleteOne({ _id: postExist._id })

      return {
        code: 200,
        success: true,
        message: "Post deleted successfully",
      }
    } catch (err) {
      if (!err?.extensions) {
        throw new ApolloError(err.message, 500)
      } else {
        throw new ApolloError(err.message, err.extensions.code)
      }
    }
  },
}

module.exports = postMutations
