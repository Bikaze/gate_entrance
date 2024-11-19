const QRCode = require('../models/qrcode');
const crypto = require('crypto');
const { validateQRCodeGeneration } = require('../utils/validation');

exports.generateQRCodes = async (req, res) => {
  const { count } = req.body;

  const validationError = validateQRCodeGeneration(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(32).toString('hex');
      codes.push(code);
      await QRCode.create({ code, isUsed: false });
    }

    res.status(201).json({ codes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
