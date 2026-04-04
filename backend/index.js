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

    console.log("AI_BASE_URL", AI_BASE_URL);
    const response = await axios.post(`${AI_BASE_URL}/ingest`, {
      video_id,
    });

    console.log("response ", response.data);

    res.json(response.data);
  } catch (error) {
    console.error("error response ", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { question } = req.body;

    const response = await axios.post(`${AI_BASE_URL}/chat`, {
      question,
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server runnning on port ${PORT}...`);
});
