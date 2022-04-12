const express = require('express');
const cors = require('cors');
const hpp = require('hpp');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const vision = require('@google-cloud/vision');
const { Translate } = require('@google-cloud/translate').v2;
const translate = require('@vitalets/google-translate-api');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');

const postRouter = require('./routes/post');

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
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/uploads', express.static('uploads'));

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
  app.use(hpp());
  app.use(helmet());
} else {
  app.use(morgan('dev'));
}

app.use('/', express.static(path.join(__dirname, 'uploads')));

const translates = new Translate();
const client = new vision.ImageAnnotatorClient();

app.get('/api/basic', async (req, res) => {
  // const [result] = await client.textDetection('./src/s.png');
  // console.log('Result: ');
  // const detections = result.textAnnotations;
  // console.log('Detections: ');
  // console.log(detections[0].boundingPoly);
  // res.json({ info: detections[0].boundingPoly });
});

app.get('/api/translate', async (req, res) => {
  // const [result] = await client.textDetection('./src/s.png');
  // console.log('Result: ');
  // const detections = result.textAnnotations;
  // console.log('Detections: ');
  // console.log(detections[0]);
  // try {
  //   let [translations] = await translates.translate(detections[0].description, 'en');
  //   console.log('Translations:');
  //   console.log(translations);
  //   res.json({ translate: translations });
  // } catch (err) {
  //   console.error(err);
  //   translate(detections[0].description, { to: 'en' })
  //     .then((res) => {
  //       console.log(res.text);
  //       res.json({ translate: res.text });
  //       //=> I speak English
  //       // console.log(res.from.language.iso);
  //       //=> nl
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //       res.json({ err: err });
  //     });
  // }
});

app.post('/files', (req, res, next) => {
  // const reqFiles = [];
  // try {
  //   upload(req, res, function (err) {
  //     if (err) {
  //       return res.status(400).send({
  //         //에러발생하면, 에러 메시지와 빈 파일명 array를 return한다.
  //         message: err.message,
  //         files: reqFiles,
  //       });
  //     }
  //     for (var i = 0; i < req.files.length; i++) {
  //       //저장된 파일명을 차례로 push한다.
  //       reqFiles.push(req.files[i].filename);
  //     }
  //     res.status(200).send({
  //       //저장 성공 시, 저장성공 메시지와 저장된 파일명 array를 return한다.
  //       message: 'Uploaded the file successfully',
  //       files: reqFiles,
  //     });
  //   });
  // } catch (err) {
  //   console.log(err);
  //   res.status(500).send({
  //     message: `Could not upload the file: ${err}`,
  //     files: reqFiles,
  //   });
  // }
});

app.use('/post', postRouter);

app.listen(80, () => {
  console.log('Express server listening on port ' + '80');
});
