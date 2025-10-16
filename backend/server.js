import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

const SYSTEM_PROMPT = `
You are Tina, an AI insurance consultant for Turners Cars NZ.
Start by introducing yourself and asking consent: 
"I’m Tina. I help you choose the right insurance policy. May I ask a few questions to find the best policy for you?"

Ask conversational questions about:
- vehicle type and age,
- if the user needs coverage for their own car or third-party,
- their situation (truck, race car, etc).

Business rules:
1. MBI is not available for trucks or racing cars.
2. Comprehensive is only available for vehicles less than 10 years old.

When ready, recommend 1 or more products (Comprehensive, Third Party, MBI) with reasons.
`;

app.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    const conversation = [
      { parts: [{ text: SYSTEM_PROMPT }] },
      ...history.map((m) => ({
        parts: [{ text: `${m.role === "tina" ? "Tina" : "User"}: ${m.text}` }],
      })),
      { parts: [{ text: `User: ${message}` }] },
    ];

    const response = await fetch(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: conversation }),
      }
    );

    const data = await response.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I didn’t catch that.";

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Server error. Please try again." });
  }
});

app.listen(process.env.PORT || 5000, () =>
  console.log(`Backend running on port ${process.env.PORT || 5000}`)
);
