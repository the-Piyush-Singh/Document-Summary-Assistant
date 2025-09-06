// server/routes/ai.routes.js
const express = require("express");
const aiController = require("../controllers/ai.controller");

const router = express.Router();

// POST /ai/get-review
router.post("/get-review", aiController.getReview);

module.exports = router;
