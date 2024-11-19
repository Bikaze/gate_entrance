const express = require('express');
const { generateQRCodes } = require('../controllers/qrCodeController');

const router = express.Router();

router.post('/qrcodes/generate', generateQRCodes);

module.exports = router;