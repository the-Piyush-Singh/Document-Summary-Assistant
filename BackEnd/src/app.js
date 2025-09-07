// Backend/src/app.js
const path = require('path');
const express = require('express');
const fs = require('fs');
const app = express();

// parse JSON bodies
app.use(express.json({ limit: '10mb' })); // increase limit if needed

/* -----------------------
   API ROUTES - add routes BEFORE static/catch-all
   ----------------------- */

// Simple health-check
app.get('/healthz', (req, res) => {
  res.json({ ok: true });
});

// POST /ai/get-review - replace logic with your real summarizer
app.post('/ai/get-review', async (req, res) => {
  try {
    const { text, length } = req.body ?? {};
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Missing or empty text in request body' });
    }

    // TODO: replace this with your actual summarization logic
    // For now return a dummy summary so you can verify end-to-end.
    const summary = `SUMMARY (${length ?? 'short'}): ${text.slice(0, 300)}${text.length > 300 ? '…' : ''}`;

    // Example response shape your frontend expects:
    res.json({
      text: summary,
      highlights: [], // put important sentences here if you have them
    });
  } catch (err) {
    console.error('Error in /ai/get-review:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* -----------------------
   Static frontend serving (keep AFTER API routes)
   ----------------------- */

// Correct path to frontend build (adjust if your repo layout differs)
const frontendPath = path.join(__dirname, '..', '..', 'Frontend', 'dist');
const indexHtmlPath = path.join(frontendPath, 'index.html');

if (fs.existsSync(indexHtmlPath)) {
  app.use(express.static(frontendPath));
  // Serve index.html only for GET requests that are not handled by API
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
