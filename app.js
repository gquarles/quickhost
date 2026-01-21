'use strict';

require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const publicIp = require("public-ip");
const expressip = require("express-ip");
const ipaddr = require("ipaddr.js");
const serveIndex = require("serve-index");
const fs = require("fs");

const app = express();

const externalUploads =
  (process.env.EXTERNAL_UPLOADS || "true").toString().toLowerCase() !== "false";

app.use(expressip().getIpInfoMiddleware);

app.use(express.static(path.join(__dirname, "public")));
app.use("/files", serveIndex(path.join(__dirname, "uploads")));
app.use("/html", serveIndex(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

app.get("/", async function (req, res) {
  if (!externalUploads) {
    var userIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    var ipType = ipaddr.process(userIp).range().toString();

    var serverIp = await publicIp.v4();

    if (
      ipType != "loopback" &&
      ipType != "private" &&
      serverIp.toString() != userIp.toString()
    ) {
      res.send("External file upload is disabled.");
    } else {
      res.sendFile(path.join(__dirname, "index.html"));
    }
  } else {
    res.sendFile(path.join(__dirname, "index.html"));
  }
});

app.get("/files/:name", function (req, res) {
  let fileName = req.params.name;

  res.download(path.join(__dirname, "uploads", fileName));
});

app.get("/html/:name", function (req, res) {
  let fileName = req.params.name;
  const filePath = path.join(__dirname, "uploads", fileName);
  const fileExt = path.extname(fileName).toLowerCase();

  const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"];
  const videoExts = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"];

  if (fileExt === ".html") {
    res.sendFile(filePath);
  } else if (imageExts.includes(fileExt)) {
    res.sendFile(filePath);
  } else if (videoExts.includes(fileExt)) {
    res.sendFile(filePath);
  } else {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return res.status(404).send("File not found");
      }

      res.setHeader("Content-Type", "text/plain");
      res.send(data);
    });
  }
});

app.post("/upload", upload.single("file"), (req, res) => {
  return res.status(200).send(req.file);
});

module.exports = app;
