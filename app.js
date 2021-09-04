require('dotenv').config()
const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();

app.use(express.static(__dirname + '/public'));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({ storage: storage })

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/files/:name', function (req, res) {
  let fileName = req.params.name;

  res.download(path.join(__dirname, `/uploads/${fileName}`));
});

app.post('/upload', upload.single('file'), (req, res) => {
  return res.status(200).send(req.file);
});

module.exports = app;