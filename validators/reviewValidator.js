const Yup = require("yup")

module.exports = {
  addReviewValidation(data) {
    const reviewSchema = Yup.object({
      from: Yup.string().required("Sender of review is required as [from]"),
      to: Yup.string().required("Receiver of review is required as: [to]"),
      rating: Yup.number()
        .positive()
        .integer()
        .max(5, "Maximum rating must be 5")
        .min(1, "Minimum rating must be 1")
        .required("Rating is required"),
      description: Yup.string()
        .min(3, "Review message must have at least 3 characters")
        .required("Review message is required"),
    })

    return reviewSchema
      .validate(data, { abortEarly: false })
      .then(() => ({ error: "" }))
      .catch((err) => ({ error: err.errors[0] }))
  },
}
