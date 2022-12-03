const router = require("express").Router()
const path = require("path")
const fs = require("fs")

router.get("/watch/:videoId", (req, res) => {
  try {
    const range = req.headers.range
    if (!range)
      res
        .status(400)
        .json({ success: false, message: "Range Header is required" })

    const exactVideoPath = path.join(
      __dirname,
      `../public/uploads/${req.params.videoId}`
    )
    const videoType = exactVideoPath.split(".")[-1]

    const videoSize = fs.statSync(exactVideoPath).size

    const CHUNK_SIZE = 10 ** 12
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
    console.error(`${err?.message?.split(",")[0]}:=> ${req.params.videoId}`)
  }
})

router.get("/image/:imageId", (req, res) => {
  console.log(req.params.imageId)

  res.send("Image serving")
})

module.exports = router
