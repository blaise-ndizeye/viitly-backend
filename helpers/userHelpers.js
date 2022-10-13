module.exports = {
  userData(data) {
    return {
      user_id: data._id.toString(),
      avatar: data.avatar ? `${process.env.BASE_URL}/${data.avatar}` : "",
      name: data.name,
      user_name: data.user_name,
      phone: data.phone,
      email: data.email,
      whatsapp: data.whatsapp,
      nFollowers: data.nFollowers,
      nFollowings: data.nFollowings,
      nPosts: data.nPosts,
      nProducts: data.nProducts,
      nReviews: data.nReviews,
      role: data.role,
      verified: data.verified,
      createdAt: data.createdAt.toISOString(),
    }
  },
}
