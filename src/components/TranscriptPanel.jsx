import { useEffect, useRef } from "react";

export default function TranscriptPanel({ transcript, recording, onStart, onStop, micError, transcriptError, chunkIntervalSecs }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  return (
    <div style={styles.column}>
      <div style={styles.header}>
        <span style={styles.headerLabel}>1. MIC & TRANSCRIPT</span>
        <div style={styles.headerRight}>
          {recording && (
            <span style={styles.updateHint}>updates every {chunkIntervalSecs}s</span>
          )}
          <span style={recording ? styles.badgeRecording : styles.badgeIdle}>
            {recording ? "RECORDING" : "IDLE"}
          </span>
        </div>
      </div>

      <div style={styles.micRow}>
        <button
          style={{
            ...styles.micButton,
            background: recording ? "#ef4444" : "#2563eb",
          }}
          onClick={recording ? onStop : onStart}
          aria-label={recording ? "Stop recording" : "Start recording"}
        >
          <div style={styles.micDot} />
          {recording && <div style={styles.pulseRing} />}
        </button>
        <span style={styles.micStatus}>
          {recording ? "Recording — click to stop." : "Stopped. Click to resume."}
        </span>
      </div>

      {micError && <p style={styles.errorText}>{micError}</p>}
      {transcriptError && <p style={styles.errorText}>{transcriptError}</p>}

      <div style={styles.transcriptList}>
        {transcript.length === 0 ? (
          <p style={styles.emptyState}>No transcript yet — start the mic.</p>
        ) : (
          transcript.map((entry, i) => (
            <div key={i} style={styles.entry}>
              <span style={styles.timestamp}>
                {new Date(entry.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
              <p style={{
                ...styles.entryText,
                ...(entry.error ? styles.entryError : {}),
              }}>
                {entry.text}
              </p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.6; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
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
    padding: "20px 24px",
    gap: 16,
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexShrink: 0,
  },
  headerLabel: {
    color: "#e5e7eb",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.04em",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  updateHint: {
    color: "#6b7280",
    fontSize: 11,
    letterSpacing: "0.05em",
  },
  badgeIdle: {
    color: "#6b7280",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.1em",
  },
  badgeRecording: {
    color: "#ef4444",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.1em",
  },
  micRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    flexShrink: 0,
  },
  micButton: {
    position: "relative",
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  micDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#fff",
    zIndex: 1,
  },
  pulseRing: {
    position: "absolute",
    inset: -4,
    borderRadius: "50%",
    border: "2px solid #ef4444",
    animation: "pulse 1.5s ease-out infinite",
  },
  micStatus: {
    color: "#9ca3af",
    fontSize: 12,
  },
  errorText: {
    color: "#f87171",
    fontSize: 12,
    margin: 0,
    flexShrink: 0,
  },
  transcriptList: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  emptyState: {
    color: "#4b5563",
    fontSize: 12,
    marginTop: 24,
  },
  entry: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    paddingBottom: 10,
    borderBottom: "1px solid #1f2937",
  },
  timestamp: {
    color: "#4b5563",
    fontSize: 10,
    letterSpacing: "0.04em",
  },
  entryText: {
    color: "#e5e7eb",
    fontSize: 13,
    lineHeight: 1.6,
    margin: 0,
  },
  entryError: {
    color: "#4b5563",
    fontStyle: "italic",
  },
};
