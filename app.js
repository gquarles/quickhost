require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const publicIp = require('public-ip');
const expressip = require("express-ip");
const ipaddr = require("ipaddr.js");
var serveIndex = require("serve-index");

const app = express();

app.use(expressip().getIpInfoMiddleware);

app.use(express.static(__dirname + "/public"));
app.use("/files", serveIndex(__dirname + "/uploads"));

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
  if (process.env.EXTERNAL_UPLOADS.toString().toLowerCase() == "false") {
    var userIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    var ipType = ipaddr.process(userIp).range().toString();

    var serverIp = await publicIp.v4();

    if (ipType != "loopback" && ipType != "private" && serverIp.toString() != userIp.toString()) {
      res.send("External file upload is disabled.");
    } else {
      res.sendFile(path.join(__dirname, "/index.html"));
    }
  } else {
    res.sendFile(path.join(__dirname, "/index.html"));
  }
});

app.get("/files/:name", function (req, res) {
  let fileName = req.params.name;

  res.download(path.join(__dirname, `/uploads/${fileName}`));
});

app.post("/upload", upload.single("file"), (req, res) => {
  return res.status(200).send(req.file);
});

module.exports = app;