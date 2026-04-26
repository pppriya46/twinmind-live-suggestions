import Groq from "groq-sdk";

const MODEL = "openai/gpt-oss-120b";

function getClient(apiKey) {
  return new Groq({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 0 });
}

export async function transcribeAudio(apiKey, audioBlob) {
  const client = getClient(apiKey);
  const file = new File([audioBlob], "audio.webm", { type: audioBlob.type });
  const result = await client.audio.transcriptions.create({
    file,
    model: "whisper-large-v3",
    response_format: "text",
  });
  return result;
}

export async function fetchSuggestions(apiKey, transcript, systemPrompt, temperature = 0.25, maxTokens = 2000) {
  const client = getClient(apiKey);

  const userContent = `Transcript:\n${transcript}`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    temperature,
    max_tokens: maxTokens,
  });

  const choice = response.choices[0];
  const content = choice.message.content;
  if (!content || !content.trim()) {
    console.error("[fetchSuggestions] Empty response. finish_reason:", choice.finish_reason, "usage:", response.usage);
    throw new Error("Model returned empty response — context may be too long or model refused to generate.");
  }

  const raw = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 3) return parsed;
    throw new Error(`Expected 3 suggestions, got ${parsed.length}`);
  } catch (e) {
    const salvaged = [];
    const objectPattern = /\{[^{}]*"type"\s*:[^{}]*"preview"\s*:[^{}]*\}/gs;
    for (const match of raw.matchAll(objectPattern)) {
      try { salvaged.push(JSON.parse(match[0])); } catch (_) {}
    }
    if (salvaged.length === 3) return salvaged;
    throw e;
  }
}

export async function streamChat(apiKey, messages, systemPrompt, onChunk, temperature = 0.4, maxTokens = 2000) {
  const client = getClient(apiKey);
  const cleanMessages = messages.map(({ role, content }) => ({ role, content }));
  const stream = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "system", content: systemPrompt }, ...cleanMessages],
    temperature,
    max_tokens: maxTokens,
    stream: true,
  });
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) onChunk(delta);
  }
}
