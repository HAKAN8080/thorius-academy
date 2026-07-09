const DEFAULT_MODEL = "gpt-4.1-mini";

export async function callLlmJson<T>(input: {
  system: string;
  user: string;
  temperature?: number;
}): Promise<T> {
  const apiKey = process.env.YAYINEVI_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("YAYINEVI_OPENAI_API_KEY tanımlı değil");
  }

  const model = process.env.YAYINEVI_OPENAI_MODEL ?? DEFAULT_MODEL;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: input.temperature ?? 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: input.user },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI API hatası (${response.status}): ${body}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI boş yanıt döndü");
  }

  return JSON.parse(content) as T;
}
