import SuggestionCard from "./SuggestionCard";

export default function SuggestionsPanel({ batches = [], loading, error, countdown, onRefresh, onSuggestionClick, recording }) {
  return (
    <div style={styles.column}>
      <div style={styles.header}>
        <span style={styles.headerLabel}>2. LIVE SUGGESTIONS</span>
        <span style={styles.batchCount}>
          {batches.length > 0 ? `${batches.length} BATCH${batches.length > 1 ? "ES" : ""}` : ""}
        </span>
      </div>

      <div style={styles.controls}>
        <button className="refresh-btn" style={styles.refreshButton} onClick={onRefresh} disabled={loading}>
          {loading ? "Fetching…" : "↺ Reload suggestions"}
        </button>
        <span style={styles.countdown}>
          {recording && !loading ? `auto-refresh in ${countdown}s` : recording && loading ? "fetching…" : ""}
        </span>
      </div>

      {error && <p style={styles.errorText}>{error}</p>}

      <div style={styles.feed}>
        {batches.length === 0 && !loading ? (
          <p style={styles.emptyState}>
            Suggestions appear here once recording starts.
          </p>
        ) : (
          batches.map((batch, batchIndex) => (
            <div key={batch.timestamp} style={styles.batch}>
              <div style={styles.cards}>
                {batch.suggestions.map((suggestion, i) => (
                  <SuggestionCard
                    key={i}
                    suggestion={suggestion}
                    onClick={onSuggestionClick}
                    muted={batchIndex > 0}
                  />
                ))}
              </div>
              <span style={styles.batchTimestamp}>
                — BATCH {batches.length - batchIndex} · {new Date(batch.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })} —
              </span>
            </div>
          ))
        )}

        {loading && (
          <div style={styles.skeletonBatch}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={styles.skeleton} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { opacity: 0.3; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
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
  batchCount: {
    color: "#6b7280",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
  },
  controls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexShrink: 0,
  },
  refreshButton: {
    background: "transparent",
    border: "1px solid #374151",
    borderRadius: 6,
    color: "#e5e7eb",
    fontSize: 12,
    padding: "5px 12px",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  countdown: {
    color: "#6b7280",
    fontSize: 11,
  },
  errorText: {
    color: "#f87171",
    fontSize: 12,
    margin: 0,
    flexShrink: 0,
  },
  feed: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  emptyState: {
    color: "#4b5563",
    fontSize: 12,
    marginTop: 24,
  },
  batch: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    animation: "fadeIn 0.3s ease",
  },
  batchTimestamp: {
    color: "#374151",
    fontSize: 10,
    textAlign: "center",
    letterSpacing: "0.05em",
    padding: "8px 0",
  },
  cards: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  skeletonBatch: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  skeleton: {
    height: 80,
    borderRadius: 8,
    background: "#111827",
    animation: "shimmer 1.5s ease infinite",
  },
};
