module.exports = {
  userData(data) {
    return {
      user_id: data._id.toString(),
      name: data.name,
      user_name: data.user_name,
      phone: data.phone,
      email: data.email,
      whatsapp: data.whatsapp,
      nFollowers: data.nFollowers,
      nPosts: data.nPosts,
      nProducts: data.nProducts,
      role: data.role,
      verified: data.verified,
      createdAt: data.createdAt.toISOString(),
    }
  },
}
