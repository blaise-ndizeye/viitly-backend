const nodemailer = require("nodemailer")

let mailTransporter = async ({
  hostUser,
  hostUserPassword,
  to = [],
  subject = "Hello from Wiitify",
  bodyText = "Welcome to wiitify",
}) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: hostUser,
      pass: hostUserPassword,
    },
  })

  let mailDetails = {
    to: to,
    subject: subject,
    text: bodyText,
  }

  await transporter.sendMail(mailDetails)
}

//mailTransporter()

module.exports = mailTransporter
