import { useRef, useState, useCallback, useEffect } from "react";

export default function useMicRecorder(onChunk, chunkIntervalSecs = 30) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const chunkIntervalRef = useRef(chunkIntervalSecs);
  const recordingRef = useRef(false);

  useEffect(() => { chunkIntervalRef.current = chunkIntervalSecs; }, [chunkIntervalSecs]);

  const startNewRecorder = useCallback((stream) => {
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) onChunk(e.data);
    };
    recorder.start();
  }, [onChunk]);

  const startInterval = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const current = mediaRecorderRef.current;
      if (current && current.state === "recording") current.stop();
      startNewRecorder(streamRef.current);
    }, chunkIntervalRef.current * 1000);
  }, [startNewRecorder]);

  useEffect(() => {
    if (!recordingRef.current) return;
    startInterval();
  }, [chunkIntervalSecs, startInterval]);

  const start = useCallback(async () => {
    setError(null);
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Mic access denied — please allow microphone permission and try again.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError("No microphone found — please connect one and try again.");
      } else {
        setError("Could not access microphone — please check your device and try again.");
      }
      return;
    }
    streamRef.current = stream;
    startNewRecorder(stream);
    recordingRef.current = true;
    setRecording(true);
    startInterval();
  }, [startNewRecorder, startInterval]);

  const flush = useCallback(() => {
    return new Promise((resolve) => {
      const current = mediaRecorderRef.current;
      if (!current || current.state !== "recording") {
        resolve();
        return;
      }
      const originalHandler = current.ondataavailable;
      current.ondataavailable = (e) => {
        originalHandler(e);
        resolve();
      };
      current.stop();
      startNewRecorder(streamRef.current);
    });
  }, [startNewRecorder]);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    const current = mediaRecorderRef.current;
    if (current && current.state === "recording") current.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    recordingRef.current = false;
    setRecording(false);
  }, []);

  return { recording, start, stop, flush, error };
}
