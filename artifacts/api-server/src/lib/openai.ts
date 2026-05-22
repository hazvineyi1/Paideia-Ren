import OpenAI from "openai";

const baseURL = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"];
const apiKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];

if (!baseURL || !apiKey) {
  throw new Error(
    "AI_INTEGRATIONS_OPENAI_BASE_URL and AI_INTEGRATIONS_OPENAI_API_KEY must be set.",
  );
}

export const openai = new OpenAI({ baseURL, apiKey });

export const PRIMARY_MODEL = "gpt-5-mini";

export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string,
): Promise<T> {
  const response = await openai.chat.completions.create({
    model: PRIMARY_MODEL,
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
  });
  const text = response.choices[0]?.message?.content;
  if (!text) {
    throw new Error("Empty response from model");
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Model returned invalid JSON");
  }
}
