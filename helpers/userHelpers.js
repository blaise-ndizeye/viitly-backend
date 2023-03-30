const jwt = require("jsonwebtoken")

module.exports = {
  userData(data) {
    return {
      user_id: data._id.toString(),
      avatar: data.avatar
        ? `${process.env.BASE_URL}/wfy-media/${data.avatar}`
        : "",
      name: data.name,
      user_name: data.user_name,
      phone: data.phone,
      email: data.email,
      bio: data.bio,
      nFollowers: data.nFollowers,
      nFollowings: data.nFollowings,
      nReviews: data.nReviews,
      role: data.role,
      verified: data.verified,
      blocked: data.blocked,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
    }
  },
  async generateAccessToken(user = { _id: "" }) {
    const generatedToken = await jwt.sign(
      {
        user_id: user._id.toString(),
      },
      process.env.ACCESS_SECRET,
      {
        expiresIn: "7d",
      }
    )

    return generatedToken
  },
  locationData(data) {
    if (!data)
      return {
        province: "",
        district: "",
        market_description: "",
        latitude: "",
        longitude: "",
      }
    return {
      province: data.province,
      district: data.district,
      market_description: data.market_description,
      latitude: data.latitude,
      longitude: data.longitude,
    }
  },
  archivedAccountData(data) {
    return {
      account: data.user_id,
      archivedAt: data.archivedAt.toISOString(),
      deleteAt: data.deleteAt.toISOString(),
    }
  },
}
