const cors = require('cors');
const express = require('express');
const { connectDB } = require('./config/db');
const computerRoutes = require('./routes/computerRoutes');
const qrCodeRoutes = require('./routes/qrCodeRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', computerRoutes);
app.use('/api', qrCodeRoutes);
app.use('/api', userRoutes);

app.get('/', (req, res) => {
  res.send('Computer Registration API');
});

if (process.env.NODE_ENV !== 'test') {
  connectDB();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
