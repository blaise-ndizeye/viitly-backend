module.exports = {
  reviewData(data) {
    return {
      review_id: data._id.toString(),
      rating: data.rating,
      description: data.description,
      createdAt: data.createdAt.toISOString(),
      from: data.from,
      to: data.to,
    }
  },
}
