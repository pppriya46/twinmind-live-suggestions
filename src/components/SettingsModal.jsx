import { useState } from "react";
import {
  DEFAULT_SUGGESTION_PROMPT,
  DEFAULT_DETAIL_PROMPT,
  DEFAULT_CHAT_PROMPT,
  DEFAULT_CHUNK_INTERVAL_SECS,
  DEFAULT_SUGGESTION_INTERVAL_SECS,
  DEFAULT_SUGGESTION_TEMPERATURE,
  DEFAULT_SUGGESTION_MAX_TOKENS,
  DEFAULT_DETAIL_TEMPERATURE,
  DEFAULT_DETAIL_MAX_TOKENS,
  DEFAULT_CHAT_TEMPERATURE,
  DEFAULT_CHAT_MAX_TOKENS,
} from "../utils/prompts";

export default function SettingsModal({ onSave, initialSettings }) {
  const [apiKey, setApiKey] = useState(initialSettings?.apiKey ?? "");
  const [suggestionPrompt, setSuggestionPrompt] = useState(
    initialSettings?.suggestionPrompt ?? DEFAULT_SUGGESTION_PROMPT
  );
  const [detailPrompt, setDetailPrompt] = useState(
    initialSettings?.detailPrompt ?? DEFAULT_DETAIL_PROMPT
  );
  const [chatPrompt, setChatPrompt] = useState(
    initialSettings?.chatPrompt ?? DEFAULT_CHAT_PROMPT
  );
  
  const [chunkIntervalSecs, setChunkIntervalSecs] = useState(
    initialSettings?.chunkIntervalSecs ?? DEFAULT_CHUNK_INTERVAL_SECS
  );
  const [suggestionIntervalSecs, setSuggestionIntervalSecs] = useState(
    initialSettings?.suggestionIntervalSecs ?? DEFAULT_SUGGESTION_INTERVAL_SECS
  );
  const [suggestionTemperature, setSuggestionTemperature] = useState(
    initialSettings?.suggestionTemperature ?? DEFAULT_SUGGESTION_TEMPERATURE
  );
  const [suggestionMaxTokens, setSuggestionMaxTokens] = useState(
    initialSettings?.suggestionMaxTokens ?? DEFAULT_SUGGESTION_MAX_TOKENS
  );
  const [detailTemperature, setDetailTemperature] = useState(
    initialSettings?.detailTemperature ?? DEFAULT_DETAIL_TEMPERATURE
  );
  const [detailMaxTokens, setDetailMaxTokens] = useState(
    initialSettings?.detailMaxTokens ?? DEFAULT_DETAIL_MAX_TOKENS
  );
  const [chatTemperature, setChatTemperature] = useState(
    initialSettings?.chatTemperature ?? DEFAULT_CHAT_TEMPERATURE
  );
  const [chatMaxTokens, setChatMaxTokens] = useState(
    initialSettings?.chatMaxTokens ?? DEFAULT_CHAT_MAX_TOKENS
  );

  function handleSave() {
    if (!apiKey.trim()) return;
    onSave({
      apiKey: apiKey.trim(),
      suggestionPrompt,
      detailPrompt,
      chatPrompt,
      chunkIntervalSecs: Number(chunkIntervalSecs),
      suggestionIntervalSecs: Number(suggestionIntervalSecs),
      suggestionTemperature: Number(suggestionTemperature),
      suggestionMaxTokens: Number(suggestionMaxTokens),
      detailTemperature: Number(detailTemperature),
      detailMaxTokens: Number(detailMaxTokens),
      chatTemperature: Number(chatTemperature),
      chatMaxTokens: Number(chatMaxTokens),
    });
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Settings</h2>

        <label style={styles.label}>Groq API Key *</label>
        <input
          className="tm-input"
          style={styles.input}
          type="password"
          placeholder="gsk_..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />

        <div style={styles.promptRow}>
          <div style={styles.promptCol}>
            <label style={styles.label}>Suggestion System Prompt</label>
            <textarea
              className="tm-input"
              style={{ ...styles.input, ...styles.textarea }}
              value={suggestionPrompt}
              onChange={(e) => setSuggestionPrompt(e.target.value)}
            />
          </div>
          <div style={styles.contextCol}>
            <label style={styles.label}>Temperature</label>
            <input
              className="tm-input"
              style={styles.input}
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={suggestionTemperature}
              onChange={(e) => setSuggestionTemperature(e.target.value)}
            />
            <p style={styles.hint}>{suggestionTemperature}</p>
            <label style={styles.label}>Max Tokens</label>
            <input
              className="tm-input"
              style={styles.input}
              type="number"
              min={100}
              max={2000}
              value={suggestionMaxTokens}
              onChange={(e) => setSuggestionMaxTokens(e.target.value)}
            />
          </div>
        </div>

        <div style={styles.promptRow}>
          <div style={styles.promptCol}>
            <label style={styles.label}>Detail System Prompt</label>
            <textarea
              className="tm-input"
              style={{ ...styles.input, ...styles.textarea }}
              value={detailPrompt}
              onChange={(e) => setDetailPrompt(e.target.value)}
            />
          </div>
          <div style={styles.contextCol}>
            <label style={styles.label}>Detail Context</label>
            <p style={styles.hint}>Last 700 words of transcript</p>
            <label style={styles.label}>Temperature</label>
            <input
              className="tm-input"
              style={styles.input}
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={detailTemperature}
              onChange={(e) => setDetailTemperature(e.target.value)}
            />
            <p style={styles.hint}>{detailTemperature}</p>
            <label style={styles.label}>Max Tokens</label>
            <input
              className="tm-input"
              style={styles.input}
              type="number"
              min={100}
              max={2000}
              value={detailMaxTokens}
              onChange={(e) => setDetailMaxTokens(e.target.value)}
            />
          </div>
        </div>

        <div style={styles.promptRow}>
          <div style={styles.promptCol}>
            <label style={styles.label}>Chat System Prompt</label>
            <textarea
              className="tm-input"
              style={{ ...styles.input, ...styles.textarea }}
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
            />
          </div>
          <div style={styles.contextCol}>
            <label style={styles.label}>Chat Context</label>
            <p style={styles.hint}>Last 700 words of transcript</p>
            <label style={styles.label}>Temperature</label>
            <input
              className="tm-input"
              style={styles.input}
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={chatTemperature}
              onChange={(e) => setChatTemperature(e.target.value)}
            />
            <p style={styles.hint}>{chatTemperature}</p>
            <label style={styles.label}>Max Tokens</label>
            <input
              className="tm-input"
              style={styles.input}
              type="number"
              min={100}
              max={2000}
              value={chatMaxTokens}
              onChange={(e) => setChatMaxTokens(e.target.value)}
            />
          </div>
        </div>

        <div style={styles.divider} />

        <label style={styles.sectionLabel}>Timers</label>
        <div style={styles.timerRow}>
          <div style={styles.timerField}>
            <label style={styles.label}>Mic chunk interval (secs)</label>
            <input
              className="tm-input"
              style={styles.input}
              type="number"
              min={5}
              max={120}
              value={chunkIntervalSecs}
              onChange={(e) => setChunkIntervalSecs(e.target.value)}
            />
            <p style={styles.hint}>How often audio is sent to Whisper</p>
          </div>
          <div style={styles.timerField}>
            <label style={styles.label}>Suggestion interval (secs)</label>
            <input
              className="tm-input"
              style={styles.input}
              type="number"
              min={5}
              max={120}
              value={suggestionIntervalSecs}
              onChange={(e) => setSuggestionIntervalSecs(e.target.value)}
            />
            <p style={styles.hint}>How often suggestions auto-refresh</p>
          </div>
        </div>

        <button
          style={{
            ...styles.button,
            opacity: apiKey.trim() ? 1 : 0.4,
            cursor: apiKey.trim() ? "pointer" : "not-allowed",
          }}
          onClick={handleSave}
          disabled={!apiKey.trim()}
        >
          Save & Continue
        </button>

        <style>{`
          .tm-input:focus {
            outline: none !important;
            border-color: #4b5563 !important;
          }
        `}</style>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  modal: {
    background: "#1f2937",
    border: "1px solid #374151",
    borderRadius: 12,
    padding: "32px 36px",
    width: "88vw",
    maxWidth: 1000,
    maxHeight: "88vh",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  title: {
    margin: "0 0 8px 0",
    color: "#e5e7eb",
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: "0.03em",
  },
  label: {
    color: "#9ca3af",
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  sectionLabel: {
    color: "#6b7280",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  input: {
    background: "#111827",
    border: "1px solid #374151",
    borderRadius: 6,
    color: "#e5e7eb",
    fontFamily: "inherit",
    fontSize: 13,
    padding: "8px 10px",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  },
  textarea: {
    resize: "vertical",
    minHeight: 90,
  },
  promptRow: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
  },
  promptCol: {
    flex: 3,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  contextCol: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  timerRow: {
    display: "flex",
    gap: 16,
  },
  timerField: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  hint: {
    color: "#4b5563",
    fontSize: 11,
    margin: 0,
  },
  divider: {
    height: 1,
    background: "#374151",
    margin: "8px 0",
  },
  button: {
    marginTop: 8,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "10px 0",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
