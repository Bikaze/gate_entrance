// index.js
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Placeholder route to show app is running
app.get('/', (req, res) => {
  res.send('Computer Registration API');
});

// No implementation yet - will fail tests
// POST /api/computers/:registrationId
// GET /api/computers/verify/:registrationId 
// GET /api/computers/search
// PUT /api/computers/:registrationId

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;