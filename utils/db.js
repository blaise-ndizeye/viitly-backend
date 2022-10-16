const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    // const URL =
    //   process.env.NODE_ENV === "development"
    //     ? process.env.DEV_DB_URL
    //     : process.env.PROD_DB_URL

    const URL = process.env.DEV_DB_URL
    await mongoose.connect(URL)
    console.log("Database connection established successfully...")
  } catch (err) {
    console.error(err)
  }
}

module.exports = connectDB
