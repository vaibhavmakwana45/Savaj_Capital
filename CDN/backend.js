const express = require("express");
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());
const fs = require("fs");
const path = require("path");
const multer = require("multer");

app.listen(4568, () => {
  console.log("Server is running on port 9278");
});

// Middleware to configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destinationFolder = "./files/";
    cb(null, destinationFolder);
  },
  filename: function (req, file, cb) {
    cb(null, getCurrentDateAndTime() + file.originalname.replace(/\s/g, ""));
  },
});

const upload = multer({ storage: storage });

function getCurrentDateAndTime() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const hours = String(currentDate.getHours()).padStart(2, "0");
  const minutes = String(currentDate.getMinutes()).padStart(2, "0");
  const seconds = String(currentDate.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}${hours}${minutes}${seconds}_`;
}

function getContentType(filename) {
  const extension = path.extname(filename).toLowerCase();
  switch (extension) {
    case ".pdf":
      return "application/pdf";
    case ".doc":
    case ".docx":
      return (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        "application/msword"
      );
    case ".jpeg":
    case ".jpg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".mp3":
      return "audio/mpeg";
    case ".wav":
      return "audio/wav";
    case ".mp4":
      return "video/mp4";
    case ".avi":
      return "video/x-msvideo";
    case ".mov":
      return "video/quicktime";
    case ".mkv":
      return "video/x-matroska";
    default:
      return "application/octet-stream";
  }
}

function fileExistsMiddleware(req, res, next) {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "files", filename);

  if (fs.existsSync(filePath)) {
    req.filePath = filePath;
    next();
  } else {
    res.status(404).json({ status: "error", message: "File not found" });
  }
}

function errorHandlerMiddleware(err, req, res, next) {
  res.status(500).json({ status: "error", message: err.message });
}

app.get("/api", (req, res) => {
  res.send("Success!!!!!!");
});

app.post("/api/upload", upload.array("files", 12), (req, res) => {
  try {
    const uploadedFiles = req.files.map((file) => {
      return {
        fileType: file.mimetype.split("/")[1],
        filename: file.filename,
      };
    });
    res.status(200).json({
      status: "ok",
      message: "Files uploaded successfully!",
      files: uploadedFiles,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/upload/:filename", fileExistsMiddleware, (req, res) => {
  try {
    const contentType = getContentType(req.params.filename);
    const fileBuffer = fs.readFileSync(req.filePath);
    res.set("Content-Type", contentType);
    res.send(fileBuffer);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/upload/:filename", fileExistsMiddleware, (req, res) => {
  try {
    fs.unlinkSync(req.filePath);
    res
      .status(200)
      .json({ status: "success", message: "File deleted successfully!" });
  } catch (error) {
    next(error);
  }
});

app.put(
  "/api/upload/:filename",
  upload.single("files"),
  fileExistsMiddleware,
  (req, res) => {
    try {
      fs.unlinkSync(req.filePath);
      const uploadedFile = req.file;
      const data = {
        fileType: uploadedFile.mimetype.split("/")[1],
        filename: uploadedFile.filename,
      };
      res.status(200).json({
        status: "ok",
        message: "File updated successfully!",
        file: data,
      });
    } catch (error) {
      next(error);
    }
  }
);

app.use(errorHandlerMiddleware);
