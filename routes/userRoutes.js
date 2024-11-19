// routes/userRoutes.js
const express = require('express');
const {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getPhoto
} = require('../controllers/userController');

const router = express.Router();

router.post('/users', createUser);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/photos/:id', getPhoto); // Route to get photo by user ID

module.exports = router;
