const express = require('express');
const {
  registerComputer,
  updateComputer,
  verifyComputer,
  searchComputers
} = require('../controllers/computerController');

const router = express.Router();

router.post('/computers/:registrationId', registerComputer);
router.put('/computers/:registrationId', updateComputer);
router.get('/computers/verify/:registrationId', verifyComputer);
router.get('/computers/search', searchComputers);

module.exports = router;
