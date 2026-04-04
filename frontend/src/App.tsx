import { useState, useRef, useEffect } from "react";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --surface: #111118;
    --surface2: #18181f;
    --border: rgba(255,255,255,0.07);
    --border-active: rgba(255,255,255,0.15);
    --text: #f0eff4;
    --muted: #6b6a78;
    --accent: #7c6af7;
    --accent-glow: rgba(124, 106, 247, 0.35);
    --accent2: #e86af7;
    --success: #22c55e;
    --error: #ef4444;
    --user-bg: #1c1c26;
    --ai-bg: #13161f;
    --font-display: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }

  .app {
    display: grid;
    grid-template-rows: auto 1fr auto;
    height: 100vh;
    max-width: 820px;
    margin: 0 auto;
    padding: 0 20px;
  }

  /* ── Header ── */
  .header {
    padding: 28px 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--border);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .logo-icon {
    width: 34px;
    height: 34px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }

  .logo-text {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  .logo-text span {
    color: var(--accent);
  }

  .status-pill {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 6px 14px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 500;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--muted);
    transition: all 0.3s ease;
    font-family: var(--font-body);
  }

  .status-pill.ready {
    border-color: rgba(34, 197, 94, 0.3);
    background: rgba(34, 197, 94, 0.07);
    color: var(--success);
  }

  .status-pill.loading {
    border-color: rgba(124, 106, 247, 0.3);
    background: rgba(124, 106, 247, 0.07);
    color: var(--accent);
  }

  .status-pill.error {
    border-color: rgba(239, 68, 68, 0.3);
    background: rgba(239, 68, 68, 0.07);
    color: var(--error);
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }

  .dot.pulse {
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.8); }
  }

  /* ── Ingest bar ── */
  .ingest-bar {
    padding: 16px 0 12px;
    border-bottom: 1px solid var(--border);
  }

  .ingest-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
    margin-bottom: 10px;
    font-family: var(--font-display);
  }

  .ingest-row {
    display: flex;
    gap: 10px;
    align-items: stretch;
  }

  .input-wrap {
    flex: 1;
    position: relative;
  }

  .yt-prefix {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    color: var(--muted);
    font-family: var(--font-body);
    pointer-events: none;
    white-space: nowrap;
  }

  .ingest-input {
    width: 100%;
    padding: 11px 12px 11px 170px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    font-family: var(--font-body);
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }

  .ingest-input::placeholder { color: var(--muted); }
  .ingest-input:focus { border-color: var(--border-active); }

  .btn-ingest {
    padding: 11px 22px;
    background: var(--accent);
    border: none;
    border-radius: 10px;
    color: #fff;
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 0.2s, transform 0.15s;
    letter-spacing: 0.01em;
  }

  .btn-ingest:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .btn-ingest:active:not(:disabled) { transform: translateY(0); }
  .btn-ingest:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── Messages ── */
  .messages-area {
    overflow-y: auto;
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }

  .messages-area::-webkit-scrollbar { width: 4px; }
  .messages-area::-webkit-scrollbar-track { background: transparent; }
  .messages-area::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: var(--muted);
    padding: 40px 0;
  }

  .empty-icon {
    font-size: 36px;
    opacity: 0.4;
  }

  .empty-title {
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 600;
    color: var(--muted);
  }

  .empty-hint {
    font-size: 13px;
    color: var(--muted);
    opacity: 0.7;
    text-align: center;
    line-height: 1.6;
    max-width: 280px;
  }

  .message {
    display: flex;
    flex-direction: column;
    gap: 6px;
    animation: fadeUp 0.25s ease;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .msg-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .msg-avatar {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    font-family: var(--font-display);
    flex-shrink: 0;
  }

  .msg-avatar.user {
    background: rgba(255,255,255,0.08);
    color: var(--text);
  }

  .msg-avatar.ai {
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: #fff;
  }

  .msg-name {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--muted);
    font-family: var(--font-display);
  }

  .msg-bubble {
    padding: 13px 16px;
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.65;
    border: 1px solid var(--border);
  }

  .message.user .msg-bubble {
    background: var(--user-bg);
    margin-left: 32px;
  }

  .message.ai .msg-bubble {
    background: var(--ai-bg);
    margin-left: 32px;
  }

  .sources {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .sources-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
    color: var(--muted);
    font-family: var(--font-display);
    margin-bottom: 4px;
  }

  .source-tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 9px;
    background: rgba(124, 106, 247, 0.1);
    border: 1px solid rgba(124, 106, 247, 0.2);
    border-radius: 6px;
    font-size: 11px;
    color: var(--accent);
    font-family: var(--font-body);
  }

  .typing-dots {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 4px 0;
  }

  .typing-dots span {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--muted);
    animation: blink 1.2s ease-in-out infinite;
  }

  .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
  .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes blink {
    0%, 80%, 100% { opacity: 0.3; }
    40% { opacity: 1; }
  }

  /* ── Chat input ── */
  .chat-input-area {
    padding: 14px 0 24px;
    border-top: 1px solid var(--border);
  }

  .chat-row {
    display: flex;
    gap: 10px;
    align-items: flex-end;
  }

  .chat-input {
    flex: 1;
    padding: 13px 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    color: var(--text);
    font-family: var(--font-body);
    font-size: 14px;
    outline: none;
    resize: none;
    min-height: 48px;
    max-height: 140px;
    transition: border-color 0.2s;
    line-height: 1.5;
  }

  .chat-input::placeholder { color: var(--muted); }
  .chat-input:focus { border-color: var(--border-active); }
  .chat-input:disabled { opacity: 0.4; cursor: not-allowed; }

  .btn-send {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: var(--accent);
    border: none;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
  }

  .btn-send:hover:not(:disabled) {
    opacity: 0.88;
    transform: translateY(-1px);
    box-shadow: 0 4px 20px var(--accent-glow);
  }

  .btn-send:active:not(:disabled) { transform: translateY(0); }
  .btn-send:disabled { opacity: 0.3; cursor: not-allowed; }

  .chat-hint {
    margin-top: 8px;
    font-size: 11px;
    color: var(--muted);
    opacity: 0.6;
  }
`;

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
      await axios.post("http://localhost:5000/api/ingest", {
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
      const res = await axios.post("http://localhost:5000/api/chat", {
        question: q,
      });
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
    <>
      <style>{styles}</style>
      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="logo">
            <div className="logo-icon">▶</div>
            <div className="logo-text">
              Video<span>Mind</span>
            </div>
          </div>
          <div
            className={`status-pill ${statusState === "idle" ? "" : statusState}`}
          >
            <div
              className={`dot ${statusState === "loading" ? "pulse" : ""}`}
            />
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
    </>
  );
}
