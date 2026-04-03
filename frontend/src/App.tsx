import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");

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
