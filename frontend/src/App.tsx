import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [videoId, setVideoId] = useState("");
  const [status, setStatus] = useState("");

  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");

  const handleIngest = async () => {
    if (!videoId.trim()) return;

    setStatus("Processing video...");

    try {
      const res = await axios.post("http://localhost:5000/api/ingest", {
        video_id: videoId,
      });

      setStatus("✅ Video ready! You can now ask questions.");
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to process video");
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;

    const newMessages = [...messages, { role: "user", text: question }];
    setMessages(newMessages);

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        question,
      });

      setMessages([...newMessages, { role: "ai", text: res.data.answer }]);

      setQuestion("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <section id="center">
        <h2>🎥 VideoMind AI</h2>

        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Enter YouTube Video ID"
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
            style={{ width: "300px", marginRight: "10px" }}
          />

          <button onClick={handleIngest}>Ingest</button>

          <p>{status}</p>
        </div>

        <input
          type="text"
          placeholder="Ask a question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ width: "300px", marginRight: "10px" }}
        />

        <button onClick={handleAsk}>Ask</button>

        <div style={{ marginTop: "20px" }}>
          {messages.map((msg, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <strong>{msg.role === "user" ? "You" : "AI"}:</strong>
              <p>{msg.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default App;
