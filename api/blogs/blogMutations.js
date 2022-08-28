const { ApolloError } = require("apollo-server-errors")

const Blog = require("../../models/Blog")
const UploadScope = require("../../models/UploadScope")
const { uploadBlogValidation } = require("../../validators")
const {
  isAuthenticated,
  isAccountVerified,
  isPayingUser,
  isValidUser,
} = require("../shield")
const { uploadOneFile } = require("../../helpers/uploadHelpers")
const { blogData } = require("../../helpers/blogHelpers")
const { verifyTaggedUsers } = require("../../helpers/tagHelpers")

const blogMutations = {
  async UploadBlog(_, { inputs, blogMedia }, ctx, ___) {
    try {
      const { user_id, blog_title, blog_content, tagged_users } = inputs

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isPayingUser(ctx.user)

      const userScope = await UploadScope.findOne({ user_id })
      if (userScope.blogs_available === 0)
        throw new ApolloError("Blog upload limit reached", 400)

      const { error } = await uploadBlogValidation({
        blog_title,
        blog_content,
      })
      if (error) throw new ApolloError(error, 400)

      const { tagError, validTaggedUsers } = await verifyTaggedUsers(
        tagged_users
      )
      if (tagError) throw new ApolloError(tagError, 400)

      let validUploadedBlogFile = { file_format: "", file_name: "" }
      if (blogMedia) {
        const { error, fileFormat, fileName } = await uploadOneFile(
          blogMedia,
          "image"
        )
        if (error) throw new ApolloError(error, 400)

        validUploadedBlogFile = {
          file_name: fileName,
          file_format: fileFormat,
        }
      }

      const newBlog = await new Blog({
        user_id,
        blog_title: blog_title,
        blog_content: blog_content,
        tagged_users: validTaggedUsers,
        blog_media: validUploadedBlogFile,
      }).save()

      await UploadScope.updateOne(
        { _id: userScope._id },
        {
          $set: {
            blogs_available: +userScope.blogs_available - 1,
          },
        }
      )

      return {
        code: 201,
        success: true,
        message: "Post uploaded successfully",
        blog: blogData(newBlog),
      }
    } catch (err) {
      throw new ApolloError(err.message, err.extensions.code)
    }
  },
}

module.exports = blogMutations
