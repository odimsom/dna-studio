import type { BrandDNA } from "../brand-dna/types";
import { generateJSON, streamText, type LLMMessage } from "../llm/client";
import { buildCampaignPrompt } from "./prompt-builder";

export interface CampaignConcept {
  name: string;
  description: string;
  theme: string;
  assets: CampaignAsset[];
}

export interface CampaignAsset {
  platform: string;
  caption: string;
  hashtags: string[];
  cta: string;
  imagePrompt: string;
}

export interface GeneratedCampaign {
  concepts: CampaignConcept[];
}

export async function generateCampaign(
  dna: BrandDNA,
  goal: string,
  platforms: string[],
  language: string = "English"
): Promise<GeneratedCampaign> {
  const prompt = buildCampaignPrompt(dna, goal, platforms, language);

  const messages: LLMMessage[] = [
    {
      role: "system",
      content:
        "You are an expert social media marketing strategist. Generate campaigns as structured JSON. Be creative, specific, and on-brand.",
    },
    { role: "user", content: prompt },
  ];

  return generateJSON<GeneratedCampaign>(messages, {
    maxTokens: 8192,
    temperature: 0.8,
    json: true,
  });
}

export async function* streamCampaign(
  dna: BrandDNA,
  goal: string,
  platforms: string[],
  language: string = "English"
): AsyncGenerator<string> {
  const prompt = buildCampaignPrompt(dna, goal, platforms, language);

  const messages: LLMMessage[] = [
    {
      role: "system",
      content:
        "You are an expert social media marketing strategist. Generate campaigns as structured JSON. Be creative, specific, and on-brand.",
    },
    { role: "user", content: prompt },
  ];

  yield* streamText(messages, {
    maxTokens: 8192,
    temperature: 0.8,
    json: true,
  });
}
