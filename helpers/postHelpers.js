module.exports = {
  postData(data) {
    return {
      post_id: data._id.toString(),
      owner: data.user_id,
      description: data.description,
      prized: data.prized,
      nLikes: data.nLikes,
      nComments: data.nComments,
      nShares: data.nShares,
      nViews: data.nViews,
      blocked: data.blocked,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
      tagged_users: data.tagged_users,
      post_media: data.post_media?.map((media) => ({
        file_format: media.file_format,
        file_name:
          media?.file_format === "image"
            ? `${process.env.BASE_URL}/wfy-media/${media?.file_name}`
            : `${process.env.BASE_URL}/wfy-media/watch?videoId=${media?.file_name}`,
      })),
    }
  },
}
