// models/computer.js
const mongoose = require('mongoose');

const computerSchema = new mongoose.Schema({
  registrationId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v) {
        return /^[0-9a-fA-F]{64}$/.test(v);
      },
      message: 'Registration ID must be a 64-character hex string'
    }
  },
  serialNo: { type: String, required: true },
  brand: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Computer', computerSchema);