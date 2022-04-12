const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { Translate } = require('@google-cloud/translate').v2;
const translate = require('@vitalets/google-translate-api');
const vision = require('@google-cloud/vision');

const path = require('path');
const fs = require('fs');

const translates = new Translate();
const client = new vision.ImageAnnotatorClient();

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

async function clean(file) {
  fs.unlink(file, function (err) {
    if (err) {
      console.log('Error : ', err);
    }
  });
}

router.post('/images', uploadPhoto.single('photo'), async (req, res) => {
  var _uid = req.body.uid;
  var file = req.file;
  console.log(req.query.lang);
  if (file) {
    sharp(file.path).toFile('./uploads/' + file.filename, async function (err) {
      if (err) {
        console.log('sharp>>>', err);
      } else {
        console.log(file.filename);
        console.log('resize ok !');

        const [result] = await client.textDetection('./uploads/' + file.filename);

        const detections = result.textAnnotations;

        try {
          let [translations] = await translates.translate(detections[0].description, 'en');
          res.json({ translate: translations, boundingPoly: detections[0].boundingPoly });
        } catch (err) {
          translate(detections[0].description, { to: 'en' }).then((res) => {
            res.json({ translate: res.text, boundingPoly: detections[0].boundingPoly });
          });
        }

        clean('./uploads/' + file.filename);
      }
    });
  } else throw 'error';
});

module.exports = router;
