const { ApolloError } = require("apollo-server-errors")

const Blog = require("../../models/Blog")
const UploadScope = require("../../models/UploadScope")
const Notification = require("../../models/Notification")
const Message = require("../../models/Message")
const Event = require("../../models/Event")
const Comment = require("../../models/Comment")
const ReportedContent = require("../../models/ReportedContent")
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

      //* Deleting comment replies for the blog
      const blogComments = await Comment.find({ to: blogExist._id.toString() })
      for (let blogComment of blogComments) {
        await Comment.deleteMany({ to: blogComment._id.toString() })
        await Event.deleteMany({ parent_id: blogComment._id.toString() })
      }

      //* Deleting all notifications related to blog reports
      const allReports = await ReportedContent.find({
        content_id: blogExist._id.toString(),
      })
      for (let report of allReports) {
        await Notification.deleteMany({ ref_object: report._id.toString() })
      }

      const pr1 = Blog.deleteOne({ _id: blogExist._id })
      const pr2 = Notification.deleteMany({
        ref_object: blogExist._id.toString(),
      })
      const pr3 = Message.deleteMany({ refer_item: blogExist._id.toString() })
      const pr4 = Event.deleteMany({ parent_id: blogExist._id.toString() })
      const pr5 = ReportedContent.deleteMany({
        content_id: blogExist._id.toString(),
      })
      const pr6 = Comment.deleteMany({ to: blogExist._id.toString() })

      await Promise.all([pr1, pr2, pr3, pr4, pr5, pr6])

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

      if (
        blogExists.createdAt.toISOString() !==
        blogExists.updatedAt.toISOString()
      )
        throw new ApolloError("Blog data can be updated only once", 401)

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

      if (
        blogExist.createdAt.toISOString() !== blogExist.updatedAt.toISOString()
      )
        throw new ApolloError("Blog data can be updated only one time", 401)

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
