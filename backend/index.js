const express = require("express");
const cors = require("cors");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const AI_BASE_URL = process.env.AI_BASE_URL;

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.post("/api/ingest", async (req, res) => {
  try {
    const { video_id } = req.body;

    console.log(`[POST /api/ingest] Received request for video_id: ${video_id}`);
    console.log(`[POST /api/ingest] Forwarding to AI_BASE_URL: ${AI_BASE_URL}/ingest`);
    const response = await axios.post(`${AI_BASE_URL}/ingest`, {
      video_id,
    });

    console.log("[POST /api/ingest] Successful response from AI service:", response.data);

    res.json(response.data);
  } catch (error) {
    if (error.response) {
      console.error("[POST /api/ingest] AI service returned error status:", error.response.status);
      console.error("[POST /api/ingest] AI service error data:", error.response.data);
      res.status(error.response.status).json({ error: error.response.data.detail || error.response.data.error || "AI service error" });
    } else if (error.request) {
      console.error("[POST /api/ingest] AI service did not respond or network error:", error.message);
      res.status(503).json({ error: "AI service unreachable" });
    } else {
      console.error("[POST /api/ingest] Unexpected error:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { question } = req.body;
    console.log(`[POST /api/chat] Received question: ${question}`);
    console.log(`[POST /api/chat] Forwarding to AI_BASE_URL: ${AI_BASE_URL}/chat`);

    const response = await axios.post(`${AI_BASE_URL}/chat`, {
      question,
    });

    console.log("[POST /api/chat] Successful response from AI service");
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      console.error("[POST /api/chat] AI service returned error status:", error.response.status);
      console.error("[POST /api/chat] AI service error data:", error.response.data);
      res.status(error.response.status).json({ error: error.response.data.detail || error.response.data.error || "AI service error" });
    } else if (error.request) {
      console.error("[POST /api/chat] AI service did not respond or network error:", error.message);
      res.status(503).json({ error: "AI service unreachable" });
    } else {
      console.error("[POST /api/chat] Unexpected error:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server runnning on port ${PORT}...`);
});
