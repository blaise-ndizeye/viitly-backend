const mongoose = require("mongoose")

const connectDB = async () => {
  mongoose.set("strictQuery", false)

  mongoose
    .connect(process.env.MONGODB_URL, { useUnifiedTopology: true })
    .then(() => {
      console.log("Database connection established successfully...")
    })
    .catch((err) => {
      console.error(err)
    })
}

module.exports = connectDB
