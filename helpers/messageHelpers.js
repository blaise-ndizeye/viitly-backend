module.exports = {
  messageData(data) {
    return {
      message_id: data._id.toString(),
      from: data.from,
      to: data.to,
      forwarded: data.forwarded,
      seen: data.seen,
      refer_type: data.refer_type === "" ? "NOTHING" : data.refer_type,
      refer_item: data.refer_item,
      text: data.text,
      createdAt: data.createdAt.toISOString(),
      deleted_for_sender: data.deleted_for_sender,
      deleted_for_receiver: data.deleted_for_receiver,
    }
  },
}
