const Yup = require("yup")

module.exports = {
  addReviewValidation(data) {
    const reviewSchema = Yup.object({
      from: Yup.string().required("Sender of review is required as: [from]"),
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
  registerUserValidation(data) {
    const registerUserSchema = Yup.object({
      name: Yup.string()
        .min(5, "Name must have at least 5 characters")
        .max(255, "Name length must be at most 255 characters")
        .required("Name is required"),
      user_name: Yup.string()
        .min(5, "Username must have at least 5 characters")
        .max(15, "Username must have at most 15 characters")
        .required("username is required"),
      email: Yup.string()
        .email("Email must be valid")
        .required("Email is required"),
      phone: Yup.string()
        .min(
          7,
          "Phone number must have at least 7 digits for international format"
        )
        .max(
          15,
          "Phone number must have at most 15 digits for international format"
        )
        .required("Phone number is required"),
      password: Yup.string()
        .min(6, "Password must have at least 6 characters")
        .required(),
      confirm_password: Yup.string().required(),
    })

    return registerUserSchema
      .validate(data, { abortEarly: false })
      .then(() => ({ error: "" }))
      .catch((err) => ({ error: err.errors[0] }))
  },
  loginUserValidation(data) {
    const loginUserSchema = Yup.object({
      credential: Yup.string().required(),
      password: Yup.string()
        .min(6, "Password length must be at least 6 characters")
        .required(),
    })

    return loginUserSchema
      .validate(data, { abortEarly: false })
      .then(() => ({ error: "" }))
      .catch((err) => ({ error: err.errors[0] }))
  },
  updateReviewValidation(data) {
    const updateReviewSchema = Yup.object({
      description: Yup.string()
        .min(3, "Review message must have at least 3 characters")
        .required("Review message is required"),
      rating: Yup.number()
        .positive()
        .integer()
        .max(5, "Maximum rating must be 5")
        .min(1, "Minimum rating must be 1")
        .required("Rating is required"),
    })

    return updateReviewSchema
      .validate(data, { abortEarly: false })
      .then(() => ({ error: "" }))
      .catch((err) => ({ error: err.errors[0] }))
  },
  uploadBlogValidation(data) {
    const uploadBlogSchema = Yup.object({
      blog_title: Yup.string()
        .min(5, "Blog title must have at least 5 characters")
        .required("Blog title is required"),
      blog_content: Yup.string()
        .min(20, "Blog content must have at least 20 characters")
        .required("Blog content is required"),
    })

    return uploadBlogSchema
      .validate(data, { abortEarly: false })
      .then(() => ({ error: "" }))
      .catch((err) => ({ error: err.errors[0] }))
  },
  uploadProductValidation(data) {
    const uploadProductSchema = Yup.object({
      title: Yup.string()
        .min(2, "Title length must be at least 2 characters")
        .required("Title is required"),
      price: Yup.number().positive().required("Price is required"),
      description: Yup.string().required("Description is required"),
    })

    return uploadProductSchema
      .validate(data, { abortEarly: false })
      .then(() => ({ error: "" }))
      .catch((err) => ({ error: err.errors[0] }))
  },
}
