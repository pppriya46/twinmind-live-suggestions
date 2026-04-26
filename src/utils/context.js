const BASE_RECENT_CHUNKS = 2;
const MIN_RECENT_WORDS = 60;

function formatElapsed(isoTimestamp) {
  const d = new Date(isoTimestamp);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  const s = d.getSeconds().toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function buildSuggestionContext(transcript) {
  const validEntries = transcript.filter((e) => !e.error);
  if (!validEntries.length) return "";

  let recentCount = BASE_RECENT_CHUNKS;
  const totalWords = validEntries
    .slice(-recentCount)
    .reduce((sum, e) => sum + countWords(e.text), 0);

  if (totalWords < MIN_RECENT_WORDS && validEntries.length > BASE_RECENT_CHUNKS) {
    recentCount = 3;
  }

  const recentEntries = validEntries.slice(-recentCount);
  return recentEntries
    .map((e) => `[${formatElapsed(e.timestamp)}] ${e.text}`)
    .join("\n");
}

export function buildTimestampedTranscript(transcript, maxWords) {
  const entries = transcript.filter((e) => !e.error);
  if (!entries.length) return "";

  const lines = [];
  let wordCount = 0;
  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i];
    const entryWords = entry.text.split(" ").length;
    if (maxWords > 0 && wordCount + entryWords > maxWords) break;
    lines.unshift(`[${formatElapsed(entry.timestamp)}] ${entry.text}`);
    wordCount += entryWords;
  }
  return lines.join("\n");
}
