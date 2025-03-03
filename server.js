const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

app.use(express.static('public'));

app.post('/upload', upload.single('video'), (req, res) => {
  const filePath = req.file.path;
  const outputFilePath = `processed/${Date.now()}-output.mp4`;

  ffmpeg(filePath)
    .output(outputFilePath)
    .on('end', () => {
      fs.unlinkSync(filePath);
      res.send('Video uploaded and processed successfully.');
    })
    .on('error', (err) => {
      console.error(err);
      res.status(500).send('Error processing video.');
    })
    .run();
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
