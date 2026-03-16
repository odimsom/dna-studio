import type { BrandDNA } from "../brand-dna/types";

export function buildBrandContext(dna: BrandDNA): string {
  const colors = dna.colors.map((c) => `${c.name} (${c.hex})`).join(", ");
  const fonts = dna.fonts.map((f) => `${f.family} (${f.usage})`).join(", ");

  return `BRAND PROFILE:
- Name: ${dna.name}
- Tagline: ${dna.tagline}
- Industry: ${dna.industry} / ${dna.category}
- Brand Colors: ${colors}
- Typography: ${fonts}
- Tone: ${dna.tone.primary} (primary), ${dna.tone.secondary} (secondary)
  - Formality: ${dna.tone.formality}/100
  - Energy: ${dna.tone.energy}/100
  - Warmth: ${dna.tone.warmth}/100
  - Style: ${dna.tone.description}
- Target Audience: ${dna.audience.primary} (primary), ${dna.audience.secondary} (secondary)
  - Age Range: ${dna.audience.ageRange}
  - Interests: ${dna.audience.interests.join(", ")}
  - Pain Points: ${dna.audience.painPoints.join(", ")}
- Keywords: ${dna.keywords.join(", ")}`;
}

export function buildCampaignPrompt(
  dna: BrandDNA,
  goal: string,
  platforms: string[],
  language: string = "English"
): string {
  const brandContext = buildBrandContext(dna);

  return `You are an expert social media marketing strategist. Generate a comprehensive campaign.

${brandContext}

CAMPAIGN GOAL: ${goal}
TARGET PLATFORMS: ${platforms.join(", ")}
LANGUAGE: ${language}

Generate exactly 5 campaign concepts. For each concept, create platform-specific content.

Return a JSON object with this EXACT structure:
{
  "concepts": [
    {
      "name": "<campaign concept name>",
      "description": "<2-3 sentence concept description>",
      "theme": "<one-word theme>",
      "assets": [
        {
          "platform": "<instagram|linkedin|facebook|twitter>",
          "caption": "<platform-appropriate caption with line breaks>",
          "hashtags": ["<hashtag1>", "<hashtag2>", "<hashtag3>"],
          "cta": "<call to action>",
          "imagePrompt": "<detailed image generation prompt that incorporates brand colors ${dna.colors.map((c) => c.hex).join(", ")} and ${dna.tone.primary} aesthetic>"
        }
      ]
    }
  ]
}

IMPORTANT RULES:
1. Each concept must have one asset per requested platform
2. Instagram captions should be engaging with emojis and strong hooks
3. LinkedIn content should be professional and thought-leadership oriented
4. Twitter content must be under 280 characters
5. Facebook content should be conversational and shareable
6. All content must match the brand's ${dna.tone.primary} tone
7. Image prompts must reference the brand's specific colors
8. All content must be in ${language}
9. Hashtags should be relevant and a mix of popular + niche`;
}

export function buildImagePrompt(
  dna: BrandDNA,
  conceptTheme: string,
  platform: string
): string {
  const primaryColor = dna.colors[0]?.hex || "#6366F1";
  const secondaryColor = dna.colors[1]?.hex || "#818CF8";

  const dimensions: Record<string, string> = {
    instagram: "1080x1080 square",
    facebook: "1200x630 landscape",
    linkedin: "1200x627 landscape",
    twitter: "1600x900 landscape",
  };

  return `Create a ${dna.tone.primary}, ${dna.tone.secondary} marketing image for ${dna.name}.
Theme: ${conceptTheme}
Industry: ${dna.industry}
Primary color: ${primaryColor}
Secondary color: ${secondaryColor}
Format: ${dimensions[platform] || "1080x1080 square"}
Style: Modern, clean, professional. The image should feel on-brand for a ${dna.industry} company with a ${dna.tone.primary} voice.
Do NOT include any text in the image.`;
}
