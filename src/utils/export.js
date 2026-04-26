function formatTimestamp(iso) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(startIso, endIso) {
  const secs = Math.round((new Date(endIso) - new Date(startIso)) / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
}

export function exportSession(transcript, suggestionBatches, chatHistory) {
  const now = new Date().toISOString();
  const validEntries = transcript.filter((e) => !e.error);
  const meetingStart = validEntries[0]?.timestamp ?? now;
  const meetingEnd = validEntries[validEntries.length - 1]?.timestamp ?? now;

  const overview = {
    _note: "Quick overview — read this first to understand the session at a glance",
    exportedAt: now,
    duration: validEntries.length > 1 ? formatDuration(meetingStart, meetingEnd) : "unknown",
    transcriptChunks: validEntries.length,
    suggestionBatchCount: suggestionBatches.length,
    totalSuggestionsGenerated: suggestionBatches.reduce((n, b) => n + b.suggestions.length, 0),
    chatMessageCount: chatHistory.filter((m) => m.role === "user").length,
  };

  const transcriptForExport = validEntries.map((entry, i) => ({
    index: i + 1,
    time: formatTimestamp(entry.timestamp),
    timestamp_iso: entry.timestamp,
    text: entry.text,
  }));

  const suggestionsForExport = suggestionBatches.map((batch, batchIdx) => ({
    batch: suggestionBatches.length - batchIdx,
    time: formatTimestamp(batch.timestamp),
    timestamp_iso: batch.timestamp,
    suggestions: batch.suggestions.map((s, i) => ({
      index: i + 1,
      type: s.type,
      preview: s.preview,
    })),
  }));

  const chatForExport = chatHistory.map((msg, i) => ({
    index: i + 1,
    role: msg.role,
    time: formatTimestamp(msg.timestamp),
    timestamp_iso: msg.timestamp,
    ...(msg.suggestionType ? { triggered_by_suggestion_type: msg.suggestionType } : {}),
    content: msg.content,
  }));

  const data = {
    overview,
    transcript: transcriptForExport,
    suggestion_batches: suggestionsForExport,
    chat_history: chatForExport,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `twinmind-session-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
