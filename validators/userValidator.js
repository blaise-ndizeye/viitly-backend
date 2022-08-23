module.exports = {
  registerUserValidation(data) {
    const {
      name,
      user_name,
      email,
      phone,
      whatsapp,
      password,
      confirmPassword,
    } = data

    if (!name) {
      return { error: "Name is required" }
    } else if (!user_name) {
      return { error: "Username is required" }
    } else if (!email) {
      return { error: "Email is required" }
    } else if (!phone) {
      return { error: "Phone number is required" }
    } else if (!whatsapp) {
      return { error: "Whatsapp number is required" }
    } else if (!password) {
      return { error: "Password is required" }
    } else if (password !== confirmPassword) {
      return { error: "Passwords doesn't match" }
    } else {
      return { error: "" }
    }
  },
  loginUserValidation(data) {
    if (!data.credential) {
      return { error: "Email, Phone, Whatsapp or Username is required" }
    } else if (!data.password) {
      return { error: "Password is required" }
    } else {
      return { error: "" }
    }
  },
}
