module.exports = {
  followData(data) {
    return {
      following_id: data._id.toString(),
      accepted: data.accepted,
      requestedAt: data.requestedAt.toISOString(),
      acceptedAt: data?.acceptedAt?.toISOString(),
      user: data.user_id,
      follower: data.follower_id,
    }
  },
}
