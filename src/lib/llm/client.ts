export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface LLMStreamChunk {
  content: string;
  done: boolean;
}

export interface LLMProvider {
  generate(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse>;
  stream(
    messages: LLMMessage[],
    options?: LLMOptions
  ): AsyncGenerator<LLMStreamChunk>;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
}

export type ProviderType = "openai" | "anthropic" | "ollama" | "gemini";

let cachedProvider: LLMProvider | null = null;
let cachedProviderType: string | null = null;

export async function getLLMProvider(): Promise<LLMProvider> {
  const providerType = process.env.LLM_PROVIDER || "openai";

  if (cachedProvider && cachedProviderType === providerType) {
    return cachedProvider;
  }

  switch (providerType) {
    case "openai": {
      const { OpenAIProvider } = await import("./providers/openai");
      cachedProvider = new OpenAIProvider();
      break;
    }
    case "anthropic": {
      const { AnthropicProvider } = await import("./providers/anthropic");
      cachedProvider = new AnthropicProvider();
      break;
    }
    case "ollama": {
      const { OllamaProvider } = await import("./providers/ollama");
      cachedProvider = new OllamaProvider();
      break;
    }
    case "gemini": {
      const { GeminiProvider } = await import("./providers/gemini");
      cachedProvider = new GeminiProvider();
      break;
    }
    default:
      throw new Error(`Unknown LLM provider: ${providerType}`);
  }

  cachedProviderType = providerType;
  return cachedProvider!;
}

export async function generateText(
  messages: LLMMessage[],
  options?: LLMOptions
): Promise<string> {
  const provider = await getLLMProvider();
  const response = await provider.generate(messages, options);
  return response.content;
}

export async function* streamText(
  messages: LLMMessage[],
  options?: LLMOptions
): AsyncGenerator<string> {
  const provider = await getLLMProvider();
  for await (const chunk of provider.stream(messages, options)) {
    yield chunk.content;
  }
}

export async function generateJSON<T>(
  messages: LLMMessage[],
  options?: LLMOptions
): Promise<T> {
  const content = await generateText(messages, {
    ...options,
    json: true,
    temperature: options?.temperature ?? 0,
  });
  // Extract the first JSON object from the response regardless of surrounding text
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error(
      `LLM did not return valid JSON. Response: ${content.slice(0, 300)}`
    );
  }
  return JSON.parse(match[0]) as T;
}
