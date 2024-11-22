const QRCode = require("../models/qrcode");

const validateRegistrationId = async (req, res, next) => {
  const { registrationId } = req.params;

  try {
    const qrCode = await QRCode.findOne({ code: registrationId });
    if (!qrCode) {
      return res.status(400).json({ error: "Invalid QR code" });
    }
    if (qrCode.isUsed) {
      return res.status(400).json({ error: "QR code already used" });
    }
    next();
  } catch (error) {
    console.error("Error validating registrationId:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = validateRegistrationId;
