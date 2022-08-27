const path = require("path")
const fs = require("fs")
const { extend } = require("joi")

const imageFormats = [
  ".avif",
  ".gif",
  ".jpg",
  ".jpeg",
  ".jfif",
  ".pjpeg",
  ".pjp",
  ".png",
  ".apng",
  ".avif",
  ".webp",
]
const videoFormats = [
  ".mp4",
  ".mov",
  ".wmv",
  ".avi",
  ".avhd",
  ".flv",
  ".f4v",
  ".swf",
  ".mkv",
  ".webm",
  ".mpeg",
  ".mpeg-2",
]

module.exports = {
  async uploadOneFile(file) {
    const { createReadStream, filename } = await file
    let uploadedFileFormat = ""
    const stream = createReadStream()
    let { ext, name } = path.parse(filename)

    const isImage = imageFormats.includes(ext.toLowerCase())
    const isVideo = videoFormats.includes(ext.toLowerCase())

    if (isImage) {
      uploadedFileFormat = "image"
    } else if (isVideo) {
      uploadedFileFormat = "video"
    } else {
      return {
        error: "Invalid file format: video and image formats are only allowed",
        fileName: "",
        fileFormat: "",
      }
    }

    name = `file${Math.floor(Math.random() * 1000000) + 1}`
    const uploadedFile = `${name}-${Date.now()}${ext}`
    let url = path.join(__dirname, `../public/uploads/${uploadedFile}`)

    const imageStream = await fs.createWriteStream(url)
    await stream.pipe(imageStream)

    const baseUrl = process.env.BASE_URL
    url = `${baseUrl}/${uploadedFile}`

    return {
      error: "",
      fileName: url,
      fileFormat: uploadedFileFormat,
    }
  },
  async uploadMany(files) {},
}
