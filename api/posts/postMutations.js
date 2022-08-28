const { ApolloError } = require("apollo-server-errors")

const Post = require("../../models/Post")
const {
  isAuthenticated,
  isAccountVerified,
  isPayingUser,
  isValidUser,
} = require("../shield")
const { uploadManyFiles } = require("../../helpers/uploadHelpers")
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
}

module.exports = postMutations
