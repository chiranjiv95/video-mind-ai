import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

type Message = {
  role: "user" | "ai";
  text: string;
  sources?: string[];
  typing?: boolean;
};

type StatusState = "idle" | "loading" | "ready" | "error";

export default function App() {
  const [videoId, setVideoId] = useState("");
  const [statusState, setStatusState] = useState<StatusState>("idle");
  const [statusText, setStatusText] = useState("No video loaded");
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleIngest = async () => {
    if (!videoId.trim() || isIngesting) return;
    setIsIngesting(true);
    setStatusState("loading");
    setStatusText("Processing…");

    try {
      await axios.post("https://video-mind-ai.onrender.com/api/ingest", {
        video_id: videoId,
      });
      setStatusState("ready");
      setStatusText("Ready to chat");
    } catch {
      setStatusState("error");
      setStatusText("Failed to load");
    } finally {
      setIsIngesting(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim() || isAsking) return;
    const q = question.trim();
    setQuestion("");
    setIsAsking(true);

    const userMsg: Message = { role: "user", text: q };
    const typingMsg: Message = { role: "ai", text: "", typing: true };
    setMessages((prev) => [...prev, userMsg, typingMsg]);

    try {
      const res = await axios.post(
        "https://video-mind-ai.onrender.com/api/chat",
        {
          question: q,
        },
      );
      setMessages((prev) => [
        ...prev.filter((m) => !m.typing),
        { role: "ai", text: res.data.answer, sources: res.data.sources },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev.filter((m) => !m.typing),
        { role: "ai", text: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 140) + "px";
    }
  };

  const isReady = statusState === "ready";

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">▶</div>
          <div className="logo-text">
            Vid<span>Chat</span>
          </div>
        </div>
        <div
          className={`status-pill ${statusState === "idle" ? "" : statusState}`}
        >
          <div className={`dot ${statusState === "loading" ? "pulse" : ""}`} />
          {statusText}
        </div>
      </header>

      {/* Ingest bar */}
      <div className="ingest-bar">
        <div className="ingest-label">Video source</div>
        <div className="ingest-row">
          <div className="input-wrap">
            <span className="yt-prefix">youtube.com/watch?v=</span>
            <input
              className="ingest-input"
              type="text"
              placeholder="dQw4w9WgXcQ"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleIngest()}
            />
          </div>
          <button
            className="btn-ingest"
            onClick={handleIngest}
            disabled={isIngesting || !videoId.trim()}
          >
            {isIngesting ? "Loading…" : "Load video"}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◎</div>
            <div className="empty-title">No conversation yet</div>
            <div className="empty-hint">
              {isReady
                ? "Ask anything about the video — summaries, key points, quotes, and more."
                : "Load a YouTube video above to get started."}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              <div className="msg-header">
                <div className={`msg-avatar ${msg.role}`}>
                  {msg.role === "user" ? "You" : "AI"}
                </div>
                <span className="msg-name">
                  {msg.role === "user" ? "You" : "VideoMind"}
                </span>
              </div>
              <div className="msg-bubble">
                {msg.typing ? (
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                ) : (
                  <>
                    {msg.text}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="sources">
                        <div className="sources-label">Sources</div>
                        {msg.sources.map((s, j) => (
                          <span key={j} className="source-tag">
                            ⏱ {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input */}
      <div className="chat-input-area">
        <div className="chat-row">
          <textarea
            ref={textareaRef}
            className="chat-input"
            placeholder={
              isReady ? "Ask anything about the video…" : "Load a video first"
            }
            value={question}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            disabled={!isReady || isAsking}
            rows={1}
          />
          <button
            className="btn-send"
            onClick={handleAsk}
            disabled={!isReady || isAsking || !question.trim()}
            title="Send"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <div className="chat-hint">
          Enter to send · Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}
