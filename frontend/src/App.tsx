import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleAsk = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        question,
      });

      setAnswer(res.data.answer);
    } catch (err) {
      console.error(err);
      setAnswer("Error fetching response");
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
          <strong>Answer:</strong>
          <p>{answer}</p>
        </div>
      </section>
    </>
  );
}

export default App;
