const path = require("path")
const fs = require("fs")
const { ApolloError } = require("apollo-server-errors")

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
  /*
  Uploading one file implementation
  */
  async uploadOneFile(file, fileType = "random") {
    const { createReadStream, filename } = await file
    let uploadedFileFormat = ""
    const stream = createReadStream()
    let { ext, name } = path.parse(filename)

    if (typeof file !== "object")
      return {
        error: "Ony one object file is allowed",
        fileName: "",
        fileFormat: "",
      }

    const isImage = imageFormats.includes(ext.toLowerCase())
    const isVideo = videoFormats.includes(ext.toLowerCase())

    if (fileType === "image") {
      if (!isImage)
        return {
          error: "Invalid file: Only image files are allowed",
          fileName: "",
          fileFormat: "",
        }
      uploadedFileFormat = "image"
    } else if (fileType === "video") {
      if (!isVideo)
        return {
          error: "Invalid file: Only video files are allowed",
          fileName: "",
          fileFormat: "",
        }
      uploadedFileFormat = "video"
    } else if (fileType === "random") {
      if (!isImage && !isVideo)
        return {
          error: "Invalid file: Only video or image files are allowed",
          fileName: "",
          fileFormat: "",
        }
    } else
      return {
        error: "Please provide valid file type: image or video",
      }

    name = `bm${uploadedFileFormat}${Math.floor(Math.random() * 1000000) + 1}`
    const uploadedFile = `${name}${Date.now()}${ext}`
    let url = path.join(__dirname, `../public/uploads/${uploadedFile}`)

    const imageStream = await fs.createWriteStream(url)
    await stream.pipe(imageStream)

    // const baseUrl = process.env.BASE_URL
    // url = `${baseUrl}/${uploadedFile}`

    return {
      error: "",
      fileName: uploadedFile,
      fileFormat: uploadedFileFormat,
    }
  },
  /* Uploading many files
     implementation: Only 10 files are allowed
  */
  async uploadManyFiles(files) {
    let i,
      uploadedFiles = []

    if (typeof files !== "object")
      return {
        error: "Only object files are allowed",
        uploadedFiles: [],
      }

    if (files.length > 10)
      return {
        error: "Maximum 10 files are allowed",
        uploadedFiles: [],
      }

    for (i = 0; i < files.length; i++) {
      const { filename } = await files[i]
      let { ext } = path.parse(filename)
      const isImage = imageFormats.includes(ext.toLowerCase())
      const isVideo = videoFormats.includes(ext.toLowerCase())
      if (!isImage && !isVideo)
        return {
          error:
            "Invalid file included: Only video and image files are allowed",
          uploadedFiles: [],
        }
    }

    for (i = 0; i < files.length; i++) {
      const { createReadStream, filename } = await files[i]
      let uploadedFileFormat = ""

      const stream = createReadStream()
      let { ext, name } = path.parse(filename)

      const isImage = imageFormats.includes(ext.toLowerCase())
      const isVideo = videoFormats.includes(ext.toLowerCase())

      if (isImage) {
        uploadedFileFormat = "image"
      } else if (isVideo) {
        uploadedFileFormat = "video"
      }

      name = `bm${uploadedFileFormat}${Math.floor(Math.random() * 1000000) + 1}`
      const uploadedFile = `${name}${Date.now()}${ext}`
      let url = path.join(__dirname, `../public/uploads/${uploadedFile}`)

      const imageStream = await fs.createWriteStream(url)
      await stream.pipe(imageStream)

      // const baseUrl = process.env.BASE_URL
      // url = `${baseUrl}/${uploadedFile}`

      uploadedFiles.push({
        fileName: uploadedFile,
        fileFormat: uploadedFileFormat,
      })
    }
    return {
      error: "",
      uploadedFiles,
    }
  },
  deleteUploadedFile(fileName) {
    const pathName = path.join(__dirname, `../public/uploads/${fileName}`)
    return fs.unlink(pathName, () =>
      console.error(`File doesn't exist: ${fileName}`)
    )
  },
}
