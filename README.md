# TwinMind — Live Meeting Suggestions

Real-time meeting copilot: mic → live transcript → 3 actionable suggestions every 30 seconds → streamed detail answers on tap.

**[Live demo →](https://twinmind-live-suggestions-six.vercel.app/)**

**Stack:** React + Vite · Groq SDK · Whisper Large V3 · `openai/gpt-oss-120b` via Groq · runs entirely in the browser

---

## The problem

Most meeting tools record what happened. That is not what you need mid-conversation. This tool listens continuously and surfaces the things worth acting on right now: the follow-up question that would move things forward, the number that does not add up, the commitment with no owner.

---

## How it works

```
Microphone
   │
   ▼  (Web Audio API — 30s chunks)
Whisper Large V3  ──► transcript chunks (timestamped, append-only)
                              │
                    ┌─────────┴──────────┐
                    ▼  (every 30s)       ▼  (on tap)
          gpt-oss-120b via Groq    gpt-oss-120b via Groq
          3 suggestion cards       detail answer (streamed)
                                         │
                                         ▼  (free-form follow-up)
                                   gpt-oss-120b via Groq
                                   chat response (streamed)
```

Three-column layout: transcript left, suggestion cards middle, chat right. Each card carries a type and a short preview that delivers value on its own. Tapping streams a full detail answer into the chat panel.

---

## Prerequisites

- Node.js 18+
- A modern browser (Chrome or Edge recommended — mic access requires HTTPS or localhost)
- A Groq API key (`gsk_...`)

---

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` → **Settings** → paste your Groq API key → hit the mic button.

Microphone access requires a secure context. `localhost` works in development. For any deployed URL, HTTPS is required — Vercel and Netlify enforce this automatically.

All prompts, temperatures, and intervals are editable in Settings without a rebuild.

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

Three prompts, each with a distinct role:

**Suggestions** — returns exactly 3 cards every 30 seconds, each typed and anchored to something specific in the transcript. Five types cover the gaps that matter in a live conversation: an unasked question, an unconnected insight, a vague term that needs pinning, a question that just got answered, a factual conflict. Already-surfaced suggestions are injected into each prompt to prevent repeats.

**Detail** — triggered on tap. Leads with a speakable line the user can say directly in the meeting. Format adapts to the suggestion type so the response is immediately usable, not just informational.

**Chat** — free-form follow-up grounded in the transcript. Stays concise and never fills gaps with invented context.

---

## Settings

All tuneable without a rebuild:

- Groq API key
- Suggestion & transcription interval (default 30s)
- Context window (words sent to the model, default 300)
- System prompts for suggestions, detail, and chat
- Temperature and max tokens per model call
