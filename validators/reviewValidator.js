module.exports = {
  addReviewValidation(data) {
    if (!data.from) {
      return { error: "Sender of the review is required" }
    } else if (!data.to) {
      return { error: "Receiver of the review is required" }
    } else if (!data.rating) {
      return { error: "Rating for the review is required" }
    } else if (!data.description) {
      return { error: "Descriptive message for the review is required" }
    } else {
      return { error: "" }
    }
  },
}
