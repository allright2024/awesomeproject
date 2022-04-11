const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const path = require('path');
const fs = require('fs');

const router = express.Router();

try {
  fs.accessSync('uploads');
} catch (error) {
  console.log('uploads 폴더가 없으므로 생성합니다.');
  fs.mkdirSync('uploads');
}

var storagePhotos = multer.diskStorage({
  filename: (req, file, cb) => {
    console.log(file);
    var filetype = '';
    if (file.mimetype === 'image/gif') {
      filetype = 'gif';
    }
    if (file.mimetype === 'image/png') {
      filetype = 'png';
    }
    if (file.mimetype === 'image/jpeg') {
      filetype = 'jpg';
    }
    cb(null, 'profile-' + new Date().toISOString() + '.' + filetype);
  },
});

var uploadPhoto = multer({ storage: storagePhotos });

router.post('/images', uploadPhoto.single('photo'), (req, res) => {
  var _uid = req.body.uid;
  var file = req.file;
  if (file) {
    sharp(file.path).toFile('./uploads/' + file.filename, function (err) {
      if (err) {
        console.log('sharp>>>', err);
      } else {
        console.log(file.filename);
        console.log('resize ok !');
      }
    });
  } else throw 'error';
});

module.exports = router;
