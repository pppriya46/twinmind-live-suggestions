import { useState, useEffect, useCallback, useRef } from "react";
import { fetchSuggestions } from "../api/groq";
import { buildSuggestionContext } from "../utils/context";

export default function useSuggestions(apiKey, transcript, settings, recording) {
  const intervalSecs = settings?.suggestionIntervalSecs ?? 30;
  const intervalMs = intervalSecs * 1000;

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(intervalSecs);

  const transcriptRef = useRef(transcript);
  const settingsRef = useRef(settings);
  const apiKeyRef = useRef(apiKey);
  const loadingRef = useRef(false);
  const recordingRef = useRef(recording);
  const intervalMsRef = useRef(intervalMs);
  const batchesRef = useRef([]);
  const firstFetchDoneRef = useRef(false);
  const autoRefreshTimerRef = useRef(null);
  const tickTimerRef = useRef(null);

  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { apiKeyRef.current = apiKey; }, [apiKey]);
  useEffect(() => { recordingRef.current = recording; }, [recording]);
  useEffect(() => { intervalMsRef.current = intervalMs; }, [intervalMs]);

  const startCountdown = useCallback(() => {
    clearInterval(tickTimerRef.current);
    const secs = Math.round(intervalMsRef.current / 1000);
    setCountdown(secs);
    tickTimerRef.current = setInterval(() => {
      if (recordingRef.current) setCountdown((c) => Math.max(0, c - 1));
    }, 1000);
  }, []);

  const scheduleNextAutoRefresh = useCallback(() => {
    clearTimeout(autoRefreshTimerRef.current);
    startCountdown();
    autoRefreshTimerRef.current = setTimeout(() => {
      if (recordingRef.current) doFetch();
    }, intervalMsRef.current);
  }, [startCountdown]);

  const doFetch = useCallback(async () => {
    if (loadingRef.current) return;

    const key = apiKeyRef.current;
    const tx = transcriptRef.current;
    const s = settingsRef.current;

    if (!key || !tx.length) {
      scheduleNextAutoRefresh();
      return;
    }

    const context = buildSuggestionContext(tx);
    if (!context.trim()) {
      scheduleNextAutoRefresh();
      return;
    }

    const lastBatch = batchesRef.current[0];
    const prevPreviewsLine = lastBatch
      ? `\nAlready surfaced (do not repeat these gaps): ${lastBatch.suggestions.map((s) => s.preview).join(" | ")}`
      : "";

    const systemPrompt = s.suggestionPrompt + prevPreviewsLine;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      let suggestions = await fetchSuggestions(
        key,
        context,
        systemPrompt,
        s.suggestionTemperature,
        s.suggestionMaxTokens,
      );
      if (!Array.isArray(suggestions) || suggestions.length !== 3) {
        suggestions = await fetchSuggestions(
          key,
          context,
          systemPrompt,
          s.suggestionTemperature,
          s.suggestionMaxTokens,
        );
      }
      const newBatch = { suggestions, timestamp: new Date().toISOString() };
      batchesRef.current = [newBatch, ...batchesRef.current];
      setBatches((prev) => [newBatch, ...prev]);
    } catch (err) {
      console.error("[useSuggestions] fetch failed:", err);
      setError(
        err?.status === 401
          ? "Invalid Groq API key — open Settings to correct it."
          : err?.status === 429
          ? "Rate limit reached — suggestions will resume automatically."
          : "Failed to load suggestions — check your connection and try again."
      );
    } finally {
      loadingRef.current = false;
      setLoading(false);
      scheduleNextAutoRefresh();
    }
  }, [scheduleNextAutoRefresh]);

  const refresh = useCallback(() => {
    clearTimeout(autoRefreshTimerRef.current);
    clearInterval(tickTimerRef.current);
    doFetch();
  }, [doFetch]);

  useEffect(() => {
    if (recording) {
      startCountdown();
    } else {
      firstFetchDoneRef.current = false;
      clearTimeout(autoRefreshTimerRef.current);
      clearInterval(tickTimerRef.current);
      setCountdown(intervalSecs);
    }
    return () => {
      clearTimeout(autoRefreshTimerRef.current);
      clearInterval(tickTimerRef.current);
    };
  }, [recording]);

  useEffect(() => {
    if (firstFetchDoneRef.current) return;
    if (!recordingRef.current) return;
    const validChunks = transcript.filter((e) => !e.error);
    if (!validChunks.length) return;
    firstFetchDoneRef.current = true;
    setTimeout(() => doFetch(), 0);
  }, [transcript]);

  useEffect(() => {
    if (!recording) return;
    clearTimeout(autoRefreshTimerRef.current);
    scheduleNextAutoRefresh();
  }, [intervalMs]);

  return { batches, loading, error, countdown, refresh };
}
