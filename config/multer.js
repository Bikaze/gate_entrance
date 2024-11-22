// config/multer.js
const multer = require("multer");
const storage = multer.memoryStorage(); // Store files in memory as Buffer
const upload = multer({ storage });

module.exports = upload;
