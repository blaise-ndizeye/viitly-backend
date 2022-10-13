module.exports = {
  followData(data) {
    return {
      following_id: data._id.toString(),
      accepted: data.accepted,
      requestedAt: data.requestedAt,
      acceptedAt: data.acceptedAt,
      user: data.user_id,
      follower: data.follower_id,
    }
  },
}
