const { ApolloError } = require("apollo-server-errors")

const Blog = require("../../models/Blog")
const UploadScope = require("../../models/UploadScope")
const Notification = require("../../models/Notification")
const { uploadBlogValidation } = require("../../validators")
const {
  isAuthenticated,
  isAccountVerified,
  isPayingUser,
  isValidUser,
} = require("../shield")
const {
  uploadOneFile,
  deleteUploadedFile,
} = require("../../helpers/uploadHelpers")
const { blogData } = require("../../helpers/blogHelpers")
const { verifyTaggedUsers } = require("../../helpers/tagHelpers")
const { generateServerError } = require("../../helpers/errorHelpers")

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

      if (tagged_users.length > 0 && tagged_users.includes(user_id))
        throw new ApolloError("You can not tag to your own blog", 400)

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

      if (validTaggedUsers.length > 0) {
        for (let tagged_user of validTaggedUsers) {
          await new Notification({
            notification_type: "INVITE",
            ref_object: newBlog._id.toString(),
            specified_user: tagged_user,
            body: "You have new blog suggestion",
          }).save()
        }
      }

      return {
        code: 201,
        success: true,
        message: "Blog uploaded successfully",
        blog: blogData(newBlog),
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async DeleteBlog(_, { user_id, blog_id }, ctx, ___) {
    try {
      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isPayingUser(ctx.user)

      if (!blog_id) throw new ApolloError("Blog_id is required", 400)

      const blogExist = await Blog.findOne({ _id: blog_id })
      if (!blogExist) throw new ApolloError("Blog post doesn't exist", 400)

      if (blogExist.blog_media?.file_name !== "") {
        deleteUploadedFile(blogExist.blog_media.file_name)
      }

      await Blog.deleteOne({ _id: blog_id })

      return {
        code: 200,
        success: true,
        message: "Blog deleted successfully",
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async UpdateBlogText(_, { inputs }, ctx, ___) {
    try {
      const { user_id, blog_id, blog_title, blog_content } = inputs

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isPayingUser(ctx.user)

      const blogExists = await Blog.findOne({
        $and: [{ _id: blog_id }, { user_id }],
      })
      if (!blogExists) throw new ApolloError("Blog doesn't exist", 400)

      const { error } = await uploadBlogValidation({
        blog_title,
        blog_content,
      })
      if (error) throw new ApolloError(error, 400)

      await Blog.updateOne(
        { _id: blogExists._id },
        {
          $set: {
            blog_title,
            blog_content,
          },
        }
      )

      const updatedBlog = await Blog.findById(blogExists._id)

      return {
        code: 200,
        success: true,
        message: "Blog updated successfully",
        blog: blogData(updatedBlog),
      }
    } catch (err) {
      generateServerError(err)
    }
  },
  async UpdateBlogMedia(_, args, ctx, ___) {
    try {
      const { user_id, blog_id, blogMedia } = args

      isAuthenticated(ctx)
      isValidUser(ctx.user, user_id)
      isAccountVerified(ctx.user)
      isPayingUser(ctx.user)

      const blogExist = await Blog.findOne({
        $and: [{ _id: blog_id }, { user_id }],
      })
      if (!blogExist) throw new ApolloError("Blog doesn't exist", 400)

      const { error, fileName, fileFormat } = await uploadOneFile(
        blogMedia,
        "image"
      )
      if (error) throw new ApolloError(error, 400)

      await Blog.updateOne(
        { _id: blogExist._id },
        {
          $set: {
            blog_media: {
              file_name: fileName,
              file_format: fileFormat,
            },
          },
        }
      )

      deleteUploadedFile(blogExist.blog_media.file_name)

      const updatedBlog = await Blog.findById(blogExist._id)

      return {
        code: 200,
        success: true,
        message: "Blog updated successfully",
        blog: blogData(updatedBlog),
      }
    } catch (err) {
      generateServerError(err)
    }
  },
}

module.exports = blogMutations
