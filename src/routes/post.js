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
  var lang = req.query.lang;

  let langCode;

  switch (lang) {
    case '아랍어':
      langCode = 'ar';
    case '벨라루스어':
      langCode = 'be';
    case '벵골어':
      langCode = 'bn';
    case '보스니아어':
      langCode = 'bs';
    case '불가리아어':
      langCode = 'bg';
    case '카탈루냐어':
      langCode = 'ca';
    case '중국어(간체)':
      langCode = 'zh-CN';
    case '중국어(번체)':
      langCode = 'zh-TW';
    case '코르시카어':
      langCode = 'co';
    case '크로아티아어':
      langCode = 'hr';
    case '체코어':
      langCode = 'cs';
    case '덴마크어':
      langCode = 'da';
    case '네덜란드어':
      langCode = 'nl';
    case '영어':
      langCode = 'en';
    case '핀란드어':
      langCode = 'fi';
    case '프랑스어':
      langCode = 'fr';
    case '조지아어':
      langCode = 'ka';
    case '독일어':
      langCode = 'de';
    case '그리스어':
      langCode = 'el';
    case '히브리어':
      langCode = 'he';
    case '힌디어':
      langCode = 'hi';
    case '몽어':
      langCode = 'hmn';
    case '헝가리어':
      langCode = 'hu';
    case '아이슬란드어':
      langCode = 'is';
    case '인도네시아어':
      langCode = 'id';
    case '아일랜드':
      langCode = 'ga';
    case '이탈리아어':
      langCode = 'it';
    case '일본어':
      langCode = 'ja';
    case '한국어':
      langCode = 'ko';
    case '리투아니아어':
      langCode = 'lt';
    case '룩셈부르크어':
      langCode = 'lb';
    case '마케도니아어':
      langCode = 'mk';
    case '마다가스카르어':
      langCode = 'mg';
    case '말레이어':
      langCode = 'ms';
    case '마오리어':
      langCode = 'mi';
    case '몽골어':
      langCode = 'mn';
    case '미얀마어(버마어)':
      langCode = 'my';
    case '네팔어':
      langCode = 'ne';
    case '노르웨이어':
      langCode = 'no';
    case '페르시아어':
      langCode = 'fa';
    case '포르투갈어':
      langCode = 'pt';
    case '루마니아어':
      langCode = 'ro';
    case '러시아어':
      langCode = 'ru';
    case '스코틀랜드 게일어':
      langCode = 'gd';
    case '스리랑카어':
      langCode = 'si';
    case '슬로바키아어':
      langCode = 'sk';
    case '슬로베니아어':
      langCode = 'sl';
    case '소말리어':
      langCode = 'so';
    case '스페인어':
      langCode = 'es';
    case '스웨덴어':
      langCode = 'sv';
    case '태국어':
      langCode = 'th';
    case '터키어':
      langCode = 'tr';
    case '우크라이나어':
      langCode = 'uk';
    case '우즈베크어':
      langCode = 'uz';
    case '베트남어':
      langCode = 'vi';
    case '웨일즈어':
      langCode = 'cy';
    default:
      langCode = 'ko';
  }

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
