import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

const TYPE_LABELS = {
  question:      "QUESTION TO ASK",
  talking_point: "TALKING POINT",
  answer:        "ANSWER",
  fact_check:    "FACT-CHECK",
  clarification: "CLARIFICATION",
};

const markdownComponents = {
  p: ({ children }) => <p style={{ margin: "0 0 8px 0", lineHeight: 1.7 }}>{children}</p>,
  strong: ({ children }) => <strong style={{ color: "#e5e7eb", fontWeight: 700 }}>{children}</strong>,
  ul: ({ children }) => <ul style={{ margin: "4px 0 8px 0", paddingLeft: 20 }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ margin: "4px 0 8px 0", paddingLeft: 20 }}>{children}</ol>,
  li: ({ children }) => <li style={{ marginBottom: 4, lineHeight: 1.6 }}>{children}</li>,
  h1: ({ children }) => <p style={{ color: "#e5e7eb", fontWeight: 700, fontSize: 14, margin: "8px 0 4px 0" }}>{children}</p>,
  h2: ({ children }) => <p style={{ color: "#e5e7eb", fontWeight: 700, fontSize: 13, margin: "8px 0 4px 0" }}>{children}</p>,
  h3: ({ children }) => <p style={{ color: "#e5e7eb", fontWeight: 600, fontSize: 13, margin: "6px 0 4px 0" }}>{children}</p>,
  code: ({ children }) => <code style={{ background: "#1f2937", color: "#60a5fa", padding: "1px 5px", borderRadius: 3, fontSize: 12 }}>{children}</code>,
  table: ({ children }) => <table style={{ borderCollapse: "collapse", width: "100%", margin: "8px 0", fontSize: 12 }}>{children}</table>,
  th: ({ children }) => <th style={{ border: "1px solid #374151", padding: "4px 8px", color: "#e5e7eb", textAlign: "left" }}>{children}</th>,
  td: ({ children }) => <td style={{ border: "1px solid #374151", padding: "4px 8px", color: "#d1d5db" }}>{children}</td>,
  hr: () => <hr style={{ border: "none", borderTop: "1px solid #1f2937", margin: "8px 0" }} />,
};

export default function ChatPanel({ messages, streaming, error, onSend }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!input.trim() || streaming) return;
    onSend(input.trim());
    setInput("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div style={styles.column}>
      <div style={styles.header}>
        <span style={styles.headerLabel}>3. CHAT (DETAILED ANSWERS)</span>
        <span style={styles.sessionBadge}>SESSION-ONLY</span>
      </div>

      <div style={styles.messageList}>
        {messages.length === 0 ? (
          <p style={styles.emptyState}>
            Click a suggestion or type a question below.
          </p>
        ) : (
          messages.map((msg, i) => {
            const isUser = msg.role === "user";
            const isStreaming = streaming && i === messages.length - 1 && !isUser;
            return (
              <div key={i} style={styles.messageGroup}>
                <span style={styles.roleLabel}>
                  {isUser
                    ? msg.suggestionType
                      ? `YOU · ${TYPE_LABELS[msg.suggestionType] ?? msg.suggestionType.toUpperCase()}`
                      : "YOU"
                    : "ASSISTANT"}
                </span>
                <div style={{
                  ...styles.bubble,
                  ...(isUser ? styles.bubbleUser : styles.bubbleAssistant),
                }}>
                  {isUser ? msg.content : (
                    <ReactMarkdown components={markdownComponents}>
                      {msg.content}
                    </ReactMarkdown>
                  )}
                  {isStreaming && <span style={styles.cursor}>▋</span>}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p style={styles.errorText}>{error}</p>}

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          placeholder="Ask anything…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={streaming}
        />
        <button
          style={{
            ...styles.sendButton,
            opacity: input.trim() && !streaming ? 1 : 0.4,
            cursor: input.trim() && !streaming ? "pointer" : "not-allowed",
          }}
          onClick={handleSend}
          disabled={!input.trim() || streaming}
        >
          Send
        </button>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  column: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: 24,
    gap: 16,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexShrink: 0,
  },
  headerLabel: {
    color: "#6b7280",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  sessionBadge: {
    color: "#6b7280",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  messageList: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  emptyState: {
    color: "#6b7280",
    fontSize: 13,
    textAlign: "center",
    margin: "auto",
  },
  messageGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  roleLabel: {
    color: "#6b7280",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.08em",
  },
  bubble: {
    fontSize: 13,
    lineHeight: 1.7,
  },
  bubbleUser: {
    background: "#1e3a5f",
    color: "#e5e7eb",
    padding: "10px 14px",
    borderRadius: 8,
  },
  bubbleAssistant: {
    color: "#d1d5db",
    padding: 0,
  },
  cursor: {
    display: "inline-block",
    animation: "blink 1s step-start infinite",
    marginLeft: 1,
    color: "#60a5fa",
  },
  errorText: {
    color: "#f87171",
    fontSize: 12,
    margin: 0,
    flexShrink: 0,
  },
  inputRow: {
    display: "flex",
    gap: 8,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: "#1f2937",
    border: "1px solid #374151",
    borderRadius: 6,
    color: "#e5e7eb",
    fontFamily: "inherit",
    fontSize: 13,
    padding: "10px 12px",
    outline: "none",
  },
  sendButton: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "10px 18px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
};
