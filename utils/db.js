const mongoose = require("mongoose")

const connectDB = async () => {
  const URL =
    process.env.NODE_ENV === "development"
      ? process.env.DEV_DB_URL
      : process.env.PROD_DB_URL

  mongoose
    .connect(URL)
    .then(() => {
      console.log("Database connection established successfully...")
    })
    .catch((err) => {
      console.error(err)
    })
}

module.exports = connectDB
