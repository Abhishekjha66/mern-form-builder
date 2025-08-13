const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// We are temporarily bypassing this by hardcoding the URI below.
// require('dotenv').config();

const formRoutes = require('./routes/formRoutes');
const responseRoutes = require('./routes/responseRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/forms', formRoutes);
app.use('/api/responses', responseRoutes);

const PORT = process.env.PORT || 5000;
// 🚨 MONGODB_URI has been hardcoded here to bypass the dotenv issue.
const MONGODB_URI = 'mongodb://127.0.0.1:27017/formbuilder';

mongoose.connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });
