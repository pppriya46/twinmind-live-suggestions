import { useState, useCallback } from "react";
import SettingsModal from "./components/SettingsModal";
import TranscriptPanel from "./components/TranscriptPanel";
import SuggestionsPanel from "./components/SuggestionsPanel";
import ChatPanel from "./components/ChatPanel";
import useMicRecorder from "./hooks/useMicRecorder";
import useTranscription from "./hooks/useTranscription";
import useSuggestions from "./hooks/useSuggestions";
import useChat from "./hooks/useChat";
import { exportSession } from "./utils/export";
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
} from "./utils/prompts";

const DEFAULT_SETTINGS = {
  apiKey: "",
  suggestionPrompt: DEFAULT_SUGGESTION_PROMPT,
  detailPrompt: DEFAULT_DETAIL_PROMPT,
  chatPrompt: DEFAULT_CHAT_PROMPT,
  chunkIntervalSecs: DEFAULT_CHUNK_INTERVAL_SECS,
  suggestionIntervalSecs: DEFAULT_SUGGESTION_INTERVAL_SECS,
  suggestionTemperature: DEFAULT_SUGGESTION_TEMPERATURE,
  suggestionMaxTokens: DEFAULT_SUGGESTION_MAX_TOKENS,
  detailTemperature: DEFAULT_DETAIL_TEMPERATURE,
  detailMaxTokens: DEFAULT_DETAIL_MAX_TOKENS,
  chatTemperature: DEFAULT_CHAT_TEMPERATURE,
  chatMaxTokens: DEFAULT_CHAT_MAX_TOKENS,
};

export default function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(true);

  const { transcript, addChunk, error: transcriptError } =
    useTranscription(settings.apiKey);

  const { recording, start, stop, flush, error: micError } =
    useMicRecorder(addChunk, settings.chunkIntervalSecs);

  const { batches, loading, error: suggestionsError, countdown, refresh } =
    useSuggestions(settings.apiKey, transcript, settings, recording);

  const handleRefresh = useCallback(async () => {
    await flush();
    refresh();
  }, [flush, refresh]);

  const { messages, streaming, error: chatError, sendMessage } =
    useChat(settings.apiKey, transcript, settings);

  const handleSuggestionClick = useCallback((suggestion) => {
    sendMessage(suggestion.preview, suggestion.type, suggestion);
  }, [sendMessage]);

  const handleSaveSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    setShowSettings(false);
  }, []);

  const hasData = transcript.length > 0 || batches.length > 0;

  const handleExport = useCallback(() => {
    exportSession(transcript, batches, messages);
  }, [transcript, batches, messages]);

  return (
    <>
      {showSettings && (
        <SettingsModal
          onSave={handleSaveSettings}
          initialSettings={settings}
        />
      )}

      <div style={styles.app}>
        <nav style={styles.navbar}>
          <div style={styles.navLeft}>
            <span style={styles.navTitle}>TwinMind — Live Suggestions Web App</span>
          </div>
          <div style={styles.navActions}>
            <button
              className="nav-btn"
              style={{ ...styles.navButton, opacity: hasData ? 1 : 0.4, cursor: hasData ? "pointer" : "not-allowed" }}
              onClick={handleExport}
              disabled={!hasData}
            >
              Export JSON
            </button>
            <button className="nav-btn" style={styles.navButton} onClick={() => setShowSettings(true)}>
              Settings
            </button>
          </div>
        </nav>

        <div style={styles.columns}>
          <div style={styles.column}>
            <TranscriptPanel
              transcript={transcript}
              recording={recording}
              onStart={start}
              onStop={stop}
              micError={micError}
              transcriptError={transcriptError}
              chunkIntervalSecs={settings.chunkIntervalSecs}
            />
          </div>

          <div style={styles.columnDivider} />

          <div style={styles.column}>
            <SuggestionsPanel
              batches={batches}
              loading={loading}
              error={suggestionsError}
              countdown={countdown}
              onRefresh={handleRefresh}
              onSuggestionClick={handleSuggestionClick}
              recording={recording}
            />
          </div>

          <div style={styles.columnDivider} />

          <div style={styles.column}>
            <ChatPanel
              messages={messages}
              streaming={streaming}
              error={chatError}
              onSend={sendMessage}
            />
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  app: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: "#0f1117",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 28px",
    borderBottom: "1px solid #1f2937",
    flexShrink: 0,
  },
  navLeft: {
    display: "flex",
    alignItems: "center",
  },
  navTitle: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: "0.02em",
  },
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  navButton: {
    background: "transparent",
    border: "1px solid #374151",
    borderRadius: 6,
    color: "#e5e7eb",
    fontSize: 11,
    fontWeight: 600,
    padding: "6px 14px",
    cursor: "pointer",
    letterSpacing: "0.04em",
    fontFamily: "inherit",
  },
  columns: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },
  column: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  columnDivider: {
    width: 1,
    background: "#1f2937",
    flexShrink: 0,
  },
};
