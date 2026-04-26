# TwinMind — Live Meeting Suggestions

Real-time meeting copilot: mic → live transcript → 3 actionable suggestions every 30 seconds → streamed detail answers on tap.

**[Live demo →](https://twinmind-live-suggestions-six.vercel.app/)**

**Stack:** React + Vite · Groq SDK · Whisper Large V3 · openai/gpt-oss-120b via Groq · runs entirely in the browser

---

## The problem

The obvious approach — surface what was just said — echoes the conversation back. The user already heard it. What they actually need is what the meeting still requires: the question nobody asked, the number that doesn't add up, the commitment with no owner, the deadline nobody pinned down.

---

## How it works

```
Microphone
   │
   ▼  (Web Audio API — 30s chunks)
Whisper Large V3  ──► transcript chunks (timestamped, append-only)
                              │
                              ▼  (every 30s)
               gpt-oss-120b via Groq  ──► 3 suggestion cards (JSON)
                              │
                              ▼  (on tap)
               gpt-oss-120b via Groq  ──► detail answer (streamed)
                              │
                              ▼  (free-form follow-up)
               gpt-oss-120b via Groq  ──► chat response (streamed)
```

Three-column layout: transcript left, suggestion cards middle, chat right. Each card has a type and a short preview. Tapping streams a full detail answer into chat.

---

## Quick start

```bash
npm install
npm run dev
```

Open → **Settings** → paste Groq API key (`gsk_...`) → hit mic. All prompts, temperatures, and intervals are editable in Settings without a rebuild.

---

## File structure

```
src/
├── api/
│   └── groq.js              # transcribeAudio, fetchSuggestions, streamChat
├── hooks/
│   ├── useMicRecorder.js    # Web Audio API capture and chunking
│   ├── useTranscription.js  # Whisper calls, transcript state
│   ├── useSuggestions.js    # suggestion loop, staleness injection, retry
│   └── useChat.js           # chat thread state, streaming
├── utils/
│   ├── context.js           # buildSuggestionContext, buildTimestampedTranscript
│   ├── prompts.js           # default prompts and settings constants
│   └── export.js            # session JSON export
└── components/
    ├── TranscriptPanel.jsx
    ├── SuggestionsPanel.jsx
    ├── SuggestionCard.jsx
    ├── ChatPanel.jsx
    └── SettingsModal.jsx
```

---

## Prompt design

Three prompts, each tuned separately:

- **Suggestions** (temp 0.25) — low temperature, strict JSON output. Returns exactly 3 cards from 5 types: `question`, `talking_point`, `clarification`, `answer`, `fact_check`. Every suggestion must anchor to something in the transcript — no anchor, discarded.
- **Detail** (temp 0.4) — triggered on tap. Leads with a verbatim speakable line first, then context. Format varies by suggestion type.
- **Chat** (temp 0.4) — free-form follow-up. Under 150 words, no re-explaining prior context, never invents facts not in the transcript.

Suggestions also track what's already been surfaced and inject it into the prompt to prevent repeats.

---

## Settings

All tuneable without a rebuild:

- Groq API key
- Suggestion & transcription interval (default 30s)
- Context window (words sent to the model, default 300)
- System prompts for suggestions, detail, and chat
- Temperature and max tokens for each model call

---

## What's next

**Cross-meeting memory** — each session is currently stateless. The next layer is tracking what was discussed, decided, and left open across sessions so the copilot can surface unresolved threads from weeks ago.

**Pre-meeting context** — before a meeting starts, pull relevant threads from past sessions with the same people or topic. The copilot should know what's unresolved before the first word is spoken.

**Persistent knowledge graph** — as sessions accumulate, build a per-user graph of people, decisions, and open threads. Suggestions get more precise the longer you use it.
