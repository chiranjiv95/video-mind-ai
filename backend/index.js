const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.post("/api/ingest", async (req, res) => {
  try {
    const { video_id } = req.body;

    const response = await axios.post("http://localhost:8000/ingest", {
      video_id,
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { question } = req.body;

    const response = await axios.post("http://localhost:8000/chat", {
      question,
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => {
  console.log("Server runnning on port 5000");
});
