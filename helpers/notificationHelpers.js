module.exports = {
  notificationData(data) {
    return {
      notification_id: data._id.toString(),
      refer_to: data.ref_object,
      createdAt: data.createdAt.toISOString(),
      body: data.body,
    }
  },
}
