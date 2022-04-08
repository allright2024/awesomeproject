const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

try {
  fs.accessSync('uploads');
} catch (error) {
  console.log('uploads 폴더가 없으므로 생성합니다.');
  fs.mkdirSync('uploads');
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, 'uploads');
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext);
      done(null, basename + '_' + new Date().getTime() + ext);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.post('/upload', upload.none(), async (req, res, next) => {
  try {
    if (req.body.image) {
      const image = req.body.image;
      res.json(image);
    }
    console.log(req.body);
    res.json({ error: 'no image' });
  } catch (error) {
    console.error(error);
    return res.status(403).send('사진을 업로드할 수 없습니다.');
  }
});

router.post('/', (req, res, next) => {
  res.json({ error: 'noned' });
});

module.exports = router;
