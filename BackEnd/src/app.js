// Backend/src/app.js
const path = require('path');
const express = require('express');
const fs = require('fs');
const app = express();

// Correct path to frontend build (two levels up from Backend/src)
const frontendPath = path.join(__dirname, '..', '..', 'Frontend', 'dist');
const indexHtmlPath = path.join(frontendPath, 'index.html');

if (fs.existsSync(indexHtmlPath)) {
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    res.sendFile(indexHtmlPath);
  });
  console.log('Serving frontend from:', frontendPath);
} else {
  console.warn('Frontend build not found at:', indexHtmlPath);
  app.get('*', (req, res) => {
    res.status(404).send('Frontend build not found.');
  });
}

module.exports = app;
