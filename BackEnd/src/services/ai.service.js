// server/services/ai.service.js
const generateSummary = require("../generateSummary"); // your Gemini wrapper
/**
 * Local fallback: pick top N sentences by a simple score (length * position weight)
 * @param {string} text
 * @param {number} maxHighlights
 */
function extractiveFallback(text, maxHighlights = 5) {
  if (!text || typeof text !== "string") return { text: "", highlights: [] };
  // Split into sentences (basic)
  const sents = text
    .replace(/\n+/g, " ")
    .match(/[^.!?]+[.!?]*/g) || [text.slice(0, 500)];

  // Score: longer sentences that appear earlier get slightly higher weight
  const scored = sents.map((s, i) => {
    const lengthScore = Math.min(1, s.trim().length / 200); // 0..1
    const posScore = 1 / (i + 1);
    return { s: s.trim(), score: lengthScore * 0.7 + posScore * 0.3 };
  });

  scored.sort((a, b) => b.score - a.score);
  const highlights = scored.slice(0, Math.min(maxHighlights, scored.length)).map(x => x.s);

  // Build a naive "summary" by joining top highlights (fallback)
  const summary = highlights.join(" ");
  return { text: summary, highlights };
}

/**
 * aiService: attempt to use Gemini via generateSummary(); fallback to local extractive summarizer.
 * @param {string} text
 * @param {'short'|'medium'|'long'} length
 * @returns {Promise<{text:string, highlights:string[]}>}
 */
module.exports = async function aiService(text, length) {
  // Basic validation
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new Error("Missing or empty text");
  }

  // If Gemini key is present, attempt using it.
  if (process.env.GOOGLE_GEMINI_KEY) {
    try {
      const res = await generateSummary(text, length);
      // normalize: generateSummary returns { text: "...", highlights: [...] } or similar
      const normalized = {
        text: String(res.text ?? res.summary ?? "").trim(),
        highlights: Array.isArray(res.highlights)
          ? res.highlights.map(String).map(s => s.trim()).filter(Boolean).slice(0, 5)
          : [],
      };
      // if no real content produced, fallback
      if (!normalized.text) {
        return extractiveFallback(text);
      }
      return normalized;
    } catch (err) {
      console.error("Gemini call failed, falling back to extractive: ", err?.message ?? err);
      // fallback
      return extractiveFallback(text);
    }
  }

  // No API key -> use fallback
  return extractiveFallback(text);
};
