const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const vision = require('@google-cloud/vision');
const { Translate } = require('@google-cloud/translate').v2;
const translate = require('@vitalets/google-translate-api');

const imageRouter = require('./routes/image');

const app = express();
app.use(helmet());
app.use(express.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));
app.use('/', express.static(path.join(__dirname, 'uploads')));

app.set('port', process.env.PORT || 5000);

const translates = new Translate();
const client = new vision.ImageAnnotatorClient();

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

    res.json(translate);
  } catch (err) {
    console.error(err);
    translate(detections[0].description, { to: 'en' })
      .then((res) => {
        console.log(res.text);
        res.json(res.text);
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

// app.get('/sub', async (req, res) => {
//   const [result] = await client.textDetection('./src/s.png');
//   const detections = result.textAnnotations;

//   console.log(detections[0]);
// });

app.use('/image', imageRouter);

app.listen(app.get('port'), () => {
  console.log('Express server listening on port ' + app.get('port'));
});
