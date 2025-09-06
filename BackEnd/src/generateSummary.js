// server/generateSummary.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Generate a summary with highlights using Gemini API
 * @param {string} text - Input text to summarize
 * @param {'short'|'medium'|'long'} length - Desired summary length
 * @returns {Promise<{text: string, highlights: string[]}>}
 */
module.exports = async function generateSummary(text, length = "long") {
  if (!process.env.GOOGLE_GEMINI_KEY) {
    throw new Error("GOOGLE_GEMINI_KEY is missing in environment variables");
  }
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new Error("Text is required");
  }

  // Init Gemini client
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

  // Use the lightweight model; change if you want more powerful ones
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Build a prompt
  const prompt = `
Summarize the following text in a ${length} style.
Return both:
1. A single coherent summary.
2. A list of 3-5 key highlights.

Text:
${text}
`;

  // Call Gemini
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const output = response.text();

  // Try to split into summary + highlights
  const parts = output.split(/\n\s*[-•*]\s*/); // naive bullet detection
  const summary = parts.shift()?.trim() || output.trim();

  let highlights = [];
  if (parts.length > 0) {
    highlights = parts.map(s => s.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
  }

  return {
    text: summary,
    highlights: highlights.slice(0, 5),
  };
};
