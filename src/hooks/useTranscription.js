import { useState, useCallback } from "react";
import { transcribeAudio } from "../api/groq";

// Whisper hallucinates these on silent or near-silent audio chunks
const WHISPER_HALLUCINATIONS = [
  /^thank you\.?$/i,
  /^thanks for watching\.?$/i,
  /^bye[\s\-]?bye\.?$/i,
  /^please subscribe\.?$/i,
  /^♪/,
  /^\[music\]$/i,
  /^\[silence\]$/i,
  /^ご視聴ありがとうございました/,
  /^字幕/,
  /^subtitles by/i,
  // Single foreign words / short filler phrases Whisper emits on silence
  /^дякую\.?$/i,       // Ukrainian "thank you"
  /^спасибо\.?$/i,     // Russian "thank you"
  /^merci\.?$/i,       // French "thank you"
  /^gracias\.?$/i,     // Spanish "thank you"
  /^terima kasih\.?$/i, // Malay/Indonesian "thank you"
  /^obrigado\.?$/i,    // Portuguese "thank you"
  /^danke\.?$/i,       // German "thank you"
];

function isHallucination(text) {
  const t = text.trim();
  if (t.length < 3) return true;
  // Block chunks that are mostly non-Latin characters (foreign script hallucinations)
  const nonLatin = (t.match(/[^\u0000-\u024F\s.,!?]/g) || []).length;
  if (nonLatin / t.length > 0.5) return true;
  // Block chunks that are only dots, dashes, or whitespace
  if (/^[\s.\-…]+$/.test(t)) return true;
  return WHISPER_HALLUCINATIONS.some((pattern) => pattern.test(t));
}

export default function useTranscription(apiKey) {
  const [transcript, setTranscript] = useState([]);
  const [error, setError] = useState(null);

  const addChunk = useCallback(
    async (audioBlob) => {
      if (!apiKey) {
        setError("No API key set — open Settings to add your Groq key.");
        setTranscript((prev) => [
          ...prev,
          { text: "[transcription failed]", timestamp: new Date().toISOString(), error: true },
        ]);
        return;
      }
      try {
        const text = await transcribeAudio(apiKey, audioBlob);
        if (!text || !text.trim()) return;
        if (isHallucination(text)) return;
        setError(null);
        setTranscript((prev) => [
          ...prev,
          { text: text.trim(), timestamp: new Date().toISOString() },
        ]);
      } catch (err) {
        const message =
          err?.status === 401
            ? "Invalid Groq API key — open Settings to correct it."
            : "Transcription failed — check your connection and try again.";
        setError(message);
        setTranscript((prev) => [
          ...prev,
          { text: "[transcription failed]", timestamp: new Date().toISOString(), error: true },
        ]);
      }
    },
    [apiKey]
  );

  return { transcript, addChunk, error };
}
