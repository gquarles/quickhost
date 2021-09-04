const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();

app.use(express.static(__dirname +'/public'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  const upload = multer({storage: storage})

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.post('/upload', upload.single('file'), (req, res) => {
  return res.status(200).send(req.file);
});

app.listen(80, () => {
  console.log('Express server listening on port 8080');
});