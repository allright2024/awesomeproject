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
  if (req.query.code !== 'my 1st app project') {
    return res.status(500).send('no auth');
  }
  var lang = req.query.lang;

  let langCode;

  switch (lang) {
    case '아랍어':
      langCode = 'ar';
      break;
    case '벨라루스어':
      langCode = 'be';
      break;
    case '벵골어':
      langCode = 'bn';
      break;
    case '보스니아어':
      langCode = 'bs';
      break;
    case '불가리아어':
      langCode = 'bg';
      break;
    case '카탈루냐어':
      langCode = 'ca';
      break;
    case '중국어(간체)':
      langCode = 'zh-CN';
      break;
    case '중국어(번체)':
      langCode = 'zh-TW';
      break;
    case '코르시카어':
      langCode = 'co';
      break;
    case '크로아티아어':
      langCode = 'hr';
      break;
    case '체코어':
      langCode = 'cs';
      break;
    case '덴마크어':
      langCode = 'da';
      break;
    case '네덜란드어':
      langCode = 'nl';
      break;
    case '영어':
      langCode = 'en';
      break;
    case '핀란드어':
      langCode = 'fi';
      break;
    case '프랑스어':
      langCode = 'fr';
      break;
    case '조지아어':
      langCode = 'ka';
      break;
    case '독일어':
      langCode = 'de';
      break;
    case '그리스어':
      langCode = 'el';
      break;
    case '히브리어':
      langCode = 'he';
      break;
    case '힌디어':
      langCode = 'hi';
      break;
    case '몽어':
      langCode = 'hmn';
      break;
    case '헝가리어':
      langCode = 'hu';
      break;
    case '아이슬란드어':
      langCode = 'is';
      break;
    case '인도네시아어':
      langCode = 'id';
      break;
    case '아일랜드':
      langCode = 'ga';
      break;
    case '이탈리아어':
      langCode = 'it';
      break;
    case '일본어':
      langCode = 'ja';
      break;
    case '한국어':
      langCode = 'ko';
      break;
    case '리투아니아어':
      langCode = 'lt';
      break;
    case '룩셈부르크어':
      langCode = 'lb';
      break;
    case '마케도니아어':
      langCode = 'mk';
      break;
    case '마다가스카르어':
      langCode = 'mg';
      break;
    case '말레이어':
      langCode = 'ms';
      break;
    case '마오리어':
      langCode = 'mi';
      break;
    case '몽골어':
      langCode = 'mn';
      break;
    case '미얀마어(버마어)':
      langCode = 'my';
      break;
    case '네팔어':
      langCode = 'ne';
      break;
    case '노르웨이어':
      langCode = 'no';
      break;
    case '페르시아어':
      langCode = 'fa';
      break;
    case '포르투갈어':
      langCode = 'pt';
      break;
    case '루마니아어':
      langCode = 'ro';
      break;
    case '러시아어':
      langCode = 'ru';
      break;
    case '스코틀랜드 게일어':
      langCode = 'gd';
      break;
    case '스리랑카어':
      langCode = 'si';
      break;
    case '슬로바키아어':
      langCode = 'sk';
      break;
    case '슬로베니아어':
      langCode = 'sl';
      break;
    case '소말리어':
      langCode = 'so';
      break;
    case '스페인어':
      langCode = 'es';
      break;
    case '스웨덴어':
      langCode = 'sv';
      break;
    case '태국어':
      langCode = 'th';
      break;
    case '터키어':
      langCode = 'tr';
      break;
    case '우크라이나어':
      langCode = 'uk';
      break;
    case '우즈베크어':
      langCode = 'uz';
      break;
    case '베트남어':
      langCode = 'vi';
      break;
    case '웨일즈어':
      langCode = 'cy';
      break;
    default:
      langCode = 'ko';
  }

  console.log(langCode);

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
          let [translations] = await translates.translate(detections[0].description, langCode);
          res.json({ translate: translations, boundingPoly: detections[0].boundingPoly });
        } catch (err) {
          translate(detections[0].description, { to: langCode }).then((res) => {
            res.json({ translate: res.text, boundingPoly: detections[0].boundingPoly });
          });
        }

        clean('./uploads/' + file.filename);
      }
    });
  } else throw 'error';
});

module.exports = router;
