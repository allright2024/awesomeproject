const express = require('express');
const router = express.Router();

const multer = require('multer');
const upload = multer({
  dest: 'uploads/',
});
const UserController = require('../controller/user');

router.post('/profile', upload.single('image'), UserController.uploadProfile);

module.exports = router;
