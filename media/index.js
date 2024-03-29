const path = require("path")
const fs = require("fs")
const router = require("express").Router()

router.get("/:filename", (req, res) => {
  const filename = req.params.filename
  const imagePath = path.join(__dirname, "../public/uploads", filename)

  // Get the file extension
  const ext = path.extname(imagePath).toLowerCase()

  // Check if the file exists
  if (!fs.existsSync(imagePath)) {
    res.status(404).send("Image not found")
    return
  }

  // Read the file and send it to the client
  const file = fs.readFileSync(imagePath)
  res.contentType(ext)
  res.send(file)
})

router.get("/watch", (req, res) => {
  try {
    const range = req.headers.range
    if (!range)
      return res
        .status(400)
        .json({ success: false, message: "Range Header is required" })

    if (!req.query?.videoId)
      return res.status(400).json({
        success: false,
        message: "videoId query parameter is required",
      })

    const exactVideoPath = path.join(
      __dirname,
      `../public/uploads/${req.query?.videoId}`
    )
    const videoType = exactVideoPath.split(".")[1]

    const videoSize = fs.statSync(exactVideoPath).size

    const CHUNK_SIZE = 10 ** 5
    const start = Number(range.replace(/\D/g, ""))
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1)

    const contentLength = end - start + 1
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "content-Length": contentLength,
      "Content-Type": `video/${videoType}`,
    }

    res.writeHead(206, headers)

    const videoStream = fs.createReadStream(exactVideoPath, { start, end })
    videoStream.pipe(res)
  } catch (err) {
    console.error(`${err?.message?.split(",")[0]}:=> ${req.query?.videoId}`)
  }
})

module.exports = router
