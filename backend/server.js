import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Models
const MAIN_MODEL = "gemini-2.5-pro-preview-03-25";
const FALLBACK_MODEL = "gemini-1.5-flash";

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("✅ Tina backend is running smoothly!");
});

// ✅ Chat endpoint
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ reply: "Please include a valid message." });
  }

  const prompt = `
You are Tina, a friendly and helpful AI insurance assistant for Turners.
Keep your replies short, conversational, and easy to understand (3–5 sentences max).
Avoid long lists or markdown formatting. Use plain text.
User said: "${message}"
`;

  try {
    // Try with the main model
    const model = genAI.getGenerativeModel({ model: MAIN_MODEL });
    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    console.log("✅ Reply generated using:", MAIN_MODEL);
    return res.json({ reply });
  } catch (error) {
    console.error("❌ Gemini API error (main):", error.message);

    // Fallback if model overloaded
    if (
      error?.response?.data?.error?.status === "UNAVAILABLE" ||
      error?.response?.data?.error?.code === 503
    ) {
      console.log("⚡ Main model overloaded. Switching to fallback model...");
      try {
        const fallback = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
        const result = await fallback.generateContent(prompt);
        const reply = result.response.text();

        console.log("✅ Reply generated using:", FALLBACK_MODEL);
        return res.json({ reply });
      } catch (fallbackError) {
        console.error("❌ Fallback model failed:", fallbackError.message);
        return res
          .status(500)
          .json({ reply: "Tina is taking a quick nap. Try again soon." });
      }
    }

    return res.status(500).json({
      reply:
        "Sorry, Tina encountered an issue. Please check your API key or try again later.",
    });
  }
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
  console.log(`🌐 Primary Gemini model: ${MAIN_MODEL}`);
});
