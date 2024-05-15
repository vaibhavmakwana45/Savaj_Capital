const express = require("express");
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());
const fs = require("fs");
const path = require("path");
const multer = require("multer");

app.get("/", async (req, res) => {
  res.send("Success!!!!!!");
});

app.listen(5883, () => {
  console.log("Server Started");
});

function getCurrentDateAndTime() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const hours = String(currentDate.getHours()).padStart(2, "0");
  const minutes = String(currentDate.getMinutes()).padStart(2, "0");
  const seconds = String(currentDate.getSeconds()).padStart(2, "0");
  return (formattedDateTime = `${year}-${month}-${day}-${hours}-${minutes}-${seconds}-`);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let destinationFolder = "./files/";
    cb(null, destinationFolder);
  },
  filename: function (req, file, cb) {
    cb(null, getCurrentDateAndTime() + file.originalname.replace(/\s/g, ""));
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.array("files", 12), async (req, res) => {
  try {
    const uploadedFiles = req.files.map((file, index) => {
      return {
        fileType: file.mimetype.split("/")[1],
        filename: file.filename,
      };
    });
    return res.status(200).json({
      status: "ok",
      message: "Files uploaded successfully!",
      files: uploadedFiles,
    });
  } catch (error) {
    let errorMessage = "Internal Server Error";
    if (error.message === "Unsupported file type") {
      errorMessage =
        "Unsupported file type. Please upload a PDF, DOC, JPEG, or PNG file.";
    }
    return res
      .status(500)
      .json({ status: "error", message: error.message || errorMessage });
  }
});

app.get("/upload/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join("./files", filename);

    if (fs.existsSync(filePath)) {
      let contentType;
      if (filename.endsWith(".pdf")) {
        contentType = "application/pdf";
      } else if (filename.endsWith(".doc") || filename.endsWith(".docx")) {
        contentType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          "application/msword";
      } else if (filename.endsWith(".jpeg") || filename.endsWith(".jpg")) {
        contentType = "image/jpeg";
      } else if (filename.endsWith(".png")) {
        contentType = "image/png";
      } else {
        contentType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          "application/msword";
      }
      const fileBuffer = fs.readFileSync(filePath);
      res.set("Content-Type", contentType);
      res.send(fileBuffer);
    } else {
      res.status(404).json({ status: "error", message: "Document not found" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.delete("/upload/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;

    const filePath = path.join("./files/", filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res
        .status(200)
        .json({ status: "success", message: "File deleted successfully!" });
    } else {
      res.status(404).json({ status: "error", message: "File not found" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

//put api
app.put("/upload/:filename", upload.single("files"), async (req, res) => {
  try {
    const filename = req.params.filename;

    const filePath = path.join("./files/", filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      const uploadedFiles = req.file;
      const data = {
        fileType: uploadedFiles.mimetype.split("/")[1],
        filename: uploadedFiles.filename,
      };
      return res.status(200).json({
        status: "ok",
        message: "Files Updated successfully!",
        files: data,
      });
    } else {
      res.status(404).json({ status: "error", message: "File not found" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});
