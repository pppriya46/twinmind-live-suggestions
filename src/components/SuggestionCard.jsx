const TYPE_STYLES = {
  question:      { color: "#60a5fa", label: "QUESTION TO ASK" },
  talking_point: { color: "#fbbf24", label: "TALKING POINT" },
  answer:        { color: "#34d399", label: "ANSWER" },
  fact_check:    { color: "#f87171", label: "FACT-CHECK" },
  clarification: { color: "#a78bfa", label: "CLARIFICATION" },
};

const fallback = { color: "#9ca3af", label: "SUGGESTION" };

export default function SuggestionCard({ suggestion, onClick, muted }) {
  const { color, label } = TYPE_STYLES[suggestion.type] ?? fallback;

  return (
    <div
      style={{
        ...styles.card,
        ...(muted ? styles.cardMuted : { borderColor: color }),
      }}
      onClick={() => onClick(suggestion)}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#1a2332";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#111827";
      }}
    >
      <span style={{ ...styles.badge, color }}>
        {label}
      </span>
      <p style={styles.preview}>{suggestion.preview}</p>
    </div>
  );
}

const styles = {
  card: {
    background: "#111827",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#1f2937",
    borderRadius: 8,
    padding: "14px 16px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    transition: "background 0.15s ease",
  },
  cardMuted: {
    opacity: 0.5,
  },
  badge: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
  },
  preview: {
    color: "#e5e7eb",
    fontSize: 13,
    lineHeight: 1.6,
    margin: 0,
  },
};
