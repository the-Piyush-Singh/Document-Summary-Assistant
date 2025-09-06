// server/controllers/ai.controller.js
const aiService = require("../services/ai.service");

exports.getReview = async (req, res) => {
  try {
    const { text, length } = req.body || {};

    // Validate input
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Normalize summary length
    const allowed = ["short", "medium", "long"];
    const len = allowed.includes(length) ? length : "short";

    // Optional: limit input size to prevent abuse
    const MAX_CHARS = 500_000;
    if (text.length > MAX_CHARS) {
      return res
        .status(413)
        .json({ error: `Text too large. Max ${MAX_CHARS} characters allowed.` });
    }

    // Call AI service
    const result = await aiService(text, len);

    // Normalize service output
    const payload = {
      text: String(result?.text ?? result?.summary ?? "").trim(),
      highlights: Array.isArray(result?.highlights)
        ? result.highlights.map((s) => String(s).trim()).filter(Boolean).slice(0, 5)
        : [],
    };

    return res.json(payload);
  } catch (err) {
    console.error("Error in /ai/get-review:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
