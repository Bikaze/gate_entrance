const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    regNo: { type: Number, sparse: true, unique: true },
    nationalId: { type: Number, sparse: true, unique: true },
    name: { type: String, required: true },
    photo: { data: Buffer, contentType: String }, // Store photo as binary data
    type: { type: String, enum: ["student", "guest"], required: true },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (this.type === "student" && !this.regNo) {
    next(new Error("Student must have regNo"));
  }
  if (this.type === "guest" && !this.nationalId) {
    next(new Error("Guest must have nationalId"));
  }
  if (this.regNo && this.nationalId) {
    next(new Error("User cannot have both regNo and nationalId"));
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
