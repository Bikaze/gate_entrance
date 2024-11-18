// models/qrcode.js
const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v) {
        return /^[0-9a-fA-F]{64}$/.test(v);
      },
      message: 'QR code must be a 64-character hex string'
    }
  },
  isUsed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('QRCode', qrCodeSchema);