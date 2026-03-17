import Anthropic from "@anthropic-ai/sdk";
import type {
  LLMProvider,
  LLMMessage,
  LLMResponse,
  LLMStreamChunk,
  LLMOptions,
} from "../client";

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  private model: string;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.model = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";
  }

  async generate(
    messages: LLMMessage[],
    options?: LLMOptions
  ): Promise<LLMResponse> {
    const systemMsg = messages.find((m) => m.role === "system");
    const nonSystemMsgs = messages.filter((m) => m.role !== "system");

    // For JSON mode, append instruction to system prompt and pre-fill assistant
    // response with "{" to force the model to output only JSON
    const systemContent = [
      systemMsg?.content,
      options?.json ? "Respond with valid JSON only. No explanation, no markdown." : null,
    ]
      .filter(Boolean)
      .join("\n");

    const assistantPrefill = options?.json ? [{ role: "assistant" as const, content: "{" }] : [];

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options?.maxTokens ?? 4096,
      temperature: options?.temperature ?? 0.7,
      ...(systemContent && { system: systemContent }),
      messages: [
        ...nonSystemMsgs.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        ...assistantPrefill,
      ],
    });

    const raw =
      response.content[0]?.type === "text" ? response.content[0].text : "";
    // Re-attach the prefill character we used to force JSON mode
    const content = options?.json ? "{" + raw : raw;

    return {
      content,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
      },
    };
  }

  async *stream(
    messages: LLMMessage[],
    options?: LLMOptions
  ): AsyncGenerator<LLMStreamChunk> {
    const systemMsg = messages.find((m) => m.role === "system");
    const nonSystemMsgs = messages.filter((m) => m.role !== "system");

    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: options?.maxTokens ?? 4096,
      temperature: options?.temperature ?? 0.7,
      ...(systemMsg && { system: systemMsg.content }),
      messages: nonSystemMsgs.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield { content: event.delta.text, done: false };
      }
    }
    yield { content: "", done: true };
  }
}
