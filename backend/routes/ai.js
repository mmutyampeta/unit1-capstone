const express = require("express");

const router = express.Router();
const GEMINI_MODEL = "gemini-3.6-flash";

router.post("/stream", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "prompt is required" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "AI service is not configured" });
  }

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "You are Spoonful's cooking assistant. Answer the user's question directly with a practical, complete response for a home cook. Do not discuss prompt instructions, formatting rules, emotional barriers, or how to write the answer. Do not begin with meta-commentary such as 'Use bold text'.",
            }],
          },
          contents: [{ role: "user", parts: [{ text: prompt.trim() }] }],
          generationConfig: { maxOutputTokens: 1024 },
        }),
      },
    );

    if (!upstream.ok || !upstream.body) {
      const details = await upstream.text();
      return res.status(upstream.status || 500).json({
        error: "Failed to reach AI service",
        details,
      });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const reader = upstream.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    res.end();
  } catch (error) {
    console.error("AI stream error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to reach AI service" });
    } else {
      res.end();
    }
  }
});

module.exports = router;