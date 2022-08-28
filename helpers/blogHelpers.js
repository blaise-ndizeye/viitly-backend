module.exports = {
  blogData(data) {
    return {
      blog_id: data._id.toString(),
      owner: data.user_id,
      blog_title: data.blog_title,
      blog_content: data.blog_content,
      blog_media: {
        file_format: data.blog_media.file_format,
        file_name: `${process.env.BASE_URL}/${data.blog_media.file_name}`,
      },
      prized: data.prized,
      nLikes: data.nLikes,
      nComments: data.nComments,
      nShares: data.nShares,
      nViews: data.nViews,
      createdAt: data.createdAt.toISOString(),
      tagged_users: data.tagged_users,
    }
  },
}
