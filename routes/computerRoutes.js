// routes/computerRoutes.js
const express = require("express");
const {
  registerComputer,
  updateComputer,
  verifyComputer,
  searchComputers,
} = require("../controllers/computerController");
const validateRegistrationId = require("../middleware/validateRegistrationId");

const router = express.Router();

router.post(
  "/computers/:registrationId",
  validateRegistrationId,
  registerComputer
);
router.put(
  "/computers/:registrationId",
  validateRegistrationId,
  updateComputer
);
router.get("/computers/verify/:registrationId", verifyComputer);
router.get("/computers/search", searchComputers);

module.exports = router;
