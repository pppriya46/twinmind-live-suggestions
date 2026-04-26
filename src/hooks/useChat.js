import { useState, useCallback, useRef, useEffect } from "react";
import { streamChat } from "../api/groq";
import { buildTimestampedTranscript } from "../utils/context";

export default function useChat(apiKey, transcript, settings) {
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);

  const transcriptRef = useRef(transcript);
  const settingsRef = useRef(settings);
  const apiKeyRef = useRef(apiKey);
  const messagesRef = useRef(messages);
  const streamingRef = useRef(false);

  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { apiKeyRef.current = apiKey; }, [apiKey]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const sendMessage = useCallback(async (userText, suggestionType = null, suggestionObject = null) => {
    if (!userText.trim() || streamingRef.current) return;

    const key = apiKeyRef.current;
    const tx = transcriptRef.current;
    const s = settingsRef.current;

    const isDetailExpand = suggestionType !== null;
    const basePrompt = isDetailExpand ? s.detailPrompt : s.chatPrompt;
    const context = buildTimestampedTranscript(tx, 700);

    const suggestionBlock = suggestionObject
      ? `The user clicked this suggestion:\nType: ${suggestionObject.type}\nPreview: "${suggestionObject.preview}"\n\nGive a full detailed answer based on the transcript context below.`
      : null;

    const systemPrompt = [
      basePrompt,
      suggestionBlock,
      `Meeting context:\n${context}`,
    ].filter(Boolean).join("\n\n");

    const userMessage = {
      role: "user",
      content: userText,
      timestamp: new Date().toISOString(),
      suggestionType,
    };
    const historyForGroq = [...messagesRef.current, userMessage];

    setMessages((prev) => [...prev, userMessage]);
    setMessages((prev) => [...prev, { role: "assistant", content: "", timestamp: new Date().toISOString() }]);

    streamingRef.current = true;
    setStreaming(true);
    setError(null);

    const temperature = isDetailExpand ? s.detailTemperature : s.chatTemperature;
    const maxTokens = isDetailExpand ? s.detailMaxTokens : s.chatMaxTokens;

    try {
      await streamChat(key, historyForGroq, systemPrompt, (chunk) => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
      }, temperature, maxTokens);
    } catch (err) {
      const message =
        err?.status === 401
          ? "Invalid Groq API key — open Settings to correct it."
          : err?.status === 429
          ? "Rate limit reached — please wait a moment and try again."
          : "Chat failed — check your connection and try again.";
      setError(message);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      streamingRef.current = false;
      setStreaming(false);
    }
  }, []);

  return { messages, streaming, error, sendMessage };
}
