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
      whatsapp: Yup.string()
        .min(
          7,
          "Whatsapp number must have at least 7 digits for international format"
        )
        .max(
          15,
          "Whatsapp number must have at most 15 digits for international format"
        )
        .required("Whatsapp number is required"),
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
}
