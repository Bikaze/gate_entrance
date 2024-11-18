// models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  regNo: { 
    type: Number, 
    sparse: true,
    unique: true
  },
  nationalId: { 
    type: Number, 
    sparse: true,
    unique: true
  },
  name: { 
    type: String, 
    required: true 
  },
  photo: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['student', 'guest'], 
    required: true 
  }
}, { timestamps: true });

// Ensure either regNo or nationalId is present based on type
userSchema.pre('save', function(next) {
  if (this.type === 'student' && !this.regNo) {
    next(new Error('Student must have regNo'));
  }
  if (this.type === 'guest' && !this.nationalId) {
    next(new Error('Guest must have nationalId'));
  }
  next();
});

module.exports = mongoose.model('User', userSchema);