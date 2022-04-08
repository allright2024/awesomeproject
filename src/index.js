const express = require('express');
const cors = require('cors');
const hpp = require('hpp');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const vision = require('@google-cloud/vision');
const { Translate } = require('@google-cloud/translate').v2;
const translate = require('@vitalets/google-translate-api');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');

const imageRouter = require('./routes/image');

dotenv.config();

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_ACCESS_KEY_ID,
  region: 'ap-northeast-2',
});

const app = express();
app.use(express.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
  app.use(hpp());
  app.use(helmet());
} else {
  app.use(morgan('dev'));
}

const upload = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    bucket: 'awesomegnnc',
    key(req, file, db) {
      db(null, `original/${Date.now()}_${path.basename(file.originalname)}`);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
});

app.use('/', express.static(path.join(__dirname, 'uploads')));

const translates = new Translate();
const client = new vision.ImageAnnotatorClient();

app.get('/api/basic', async (req, res) => {
  const [result] = await client.textDetection('./src/s.png');

  console.log('Result: ');

  const detections = result.textAnnotations;
  console.log('Detections: ');
  console.log(detections[0].boundingPoly);
  res.json({ info: detections[0].boundingPoly });
});

app.get('/api/translate', async (req, res) => {
  const [result] = await client.textDetection('./src/s.png');

  console.log('Result: ');

  const detections = result.textAnnotations;
  console.log('Detections: ');
  console.log(detections[0]);

  try {
    let [translations] = await translates.translate(detections[0].description, 'en');
    console.log('Translations:');
    console.log(translations);

    res.json({ translate: translations });
  } catch (err) {
    console.error(err);
    translate(detections[0].description, { to: 'en' })
      .then((res) => {
        console.log(res.text);
        res.json({ translate: res.text });
        //=> I speak English
        // console.log(res.from.language.iso);
        //=> nl
      })
      .catch((err) => {
        console.error(err);
        res.json({ err: err });
      });
  }
});

app.get('/sub', upload.array('image'), async (req, res) => {
  console.log(req.files);
  res.json9req.files.map((v) => v.location);
});

app.use('/image', imageRouter);

app.listen(80, () => {
  console.log('Express server listening on port ' + '80');
});
