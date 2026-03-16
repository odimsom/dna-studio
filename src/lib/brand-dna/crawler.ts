import { chromium, type Browser, type Page } from "playwright";
import { extractColorsFromCSS } from "./color-extractor";
import { extractFonts } from "./font-extractor";
import { generateJSON } from "../llm/client";
import type { BrandDNA, ToneProfile, AudienceProfile, CrawlProgress } from "./types";

export type ProgressCallback = (progress: CrawlProgress) => void;

export async function crawlBrandDNA(
  url: string,
  onProgress?: ProgressCallback
): Promise<BrandDNA> {
  const progress = (step: string, status: CrawlProgress["status"], detail?: string) => {
    onProgress?.({ step, status, detail });
  };

  let browser: Browser | null = null;

  try {
    // Step 1: Launch browser and navigate
    progress("Launching browser", "running");
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();

    progress("Crawling site", "running", url);
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000); // Let dynamic content render
    progress("Crawling site", "done");

    // Step 2: Extract meta data
    progress("Extracting metadata", "running");
    const meta = await extractMetaData(page);
    progress("Extracting metadata", "done");

    // Step 3: Extract colors
    progress("Extracting colors", "running");
    const cssColors = await page.evaluate(() => {
      const colors: string[] = [];
      const elements = document.querySelectorAll("*");
      const subset = Array.from(elements).slice(0, 200);
      for (const el of subset) {
        const style = window.getComputedStyle(el);
        colors.push(style.color, style.backgroundColor, style.borderColor);
      }
      // Also get CSS custom properties from :root
      const root = document.documentElement;
      const rootStyle = window.getComputedStyle(root);
      for (let i = 0; i < rootStyle.length; i++) {
        const prop = rootStyle[i];
        if (prop.startsWith("--")) {
          colors.push(rootStyle.getPropertyValue(prop));
        }
      }
      return colors.filter(Boolean);
    });
    const colorInfos = extractColorsFromCSS(cssColors);
    progress("Extracting colors", "done", `Found ${colorInfos.length} colors`);

    // Step 4: Extract fonts
    progress("Extracting fonts", "running");
    const fontData = await page.evaluate(() => {
      const data: { family: string; tag: string; weight: string }[] = [];
      const tags = ["h1", "h2", "h3", "h4", "p", "a", "button", "span", "nav", "li"];
      for (const tag of tags) {
        const elements = document.querySelectorAll(tag);
        for (const el of Array.from(elements).slice(0, 5)) {
          const style = window.getComputedStyle(el);
          data.push({
            family: style.fontFamily,
            tag,
            weight: style.fontWeight,
          });
        }
      }
      return data;
    });
    const fontInfos = extractFonts(fontData);
    progress("Extracting fonts", "done", `Found ${fontInfos.length} fonts`);

    // Step 5: Extract page text
    progress("Extracting content", "running");
    const pageText = await page.evaluate(() => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null
      );
      const texts: string[] = [];
      let node;
      while ((node = walker.nextNode()) && texts.length < 100) {
        const text = node.textContent?.trim();
        if (text && text.length > 10) {
          texts.push(text);
        }
      }
      return texts.join("\n").slice(0, 5000);
    });
    progress("Extracting content", "done");

    // Step 6: Analyze tone and audience with LLM
    progress("Analyzing tone", "running");
    const analysis = await analyzeBrandWithLLM(
      meta.name,
      meta.description,
      pageText,
      url
    );
    progress("Analyzing tone", "done");

    progress("Complete", "done");

    return {
      name: meta.name || new URL(url).hostname,
      tagline: meta.description || "",
      url,
      logoUrl: meta.logoUrl,
      colors: colorInfos,
      fonts: fontInfos,
      tone: analysis.tone,
      audience: analysis.audience,
      industry: analysis.industry,
      category: analysis.category,
      keywords: analysis.keywords,
      rawText: pageText.slice(0, 2000),
    };
  } finally {
    if (browser) await browser.close();
  }
}

async function extractMetaData(page: Page) {
  return page.evaluate(() => {
    const getMeta = (name: string) =>
      document
        .querySelector(`meta[property="${name}"], meta[name="${name}"]`)
        ?.getAttribute("content") || "";

    const name =
      getMeta("og:site_name") ||
      getMeta("og:title") ||
      document.querySelector("h1")?.textContent?.trim() ||
      document.title;

    const description =
      getMeta("og:description") ||
      getMeta("description") ||
      document.querySelector("h1")?.textContent?.trim() ||
      "";

    // Find logo
    let logoUrl =
      getMeta("og:image") ||
      document.querySelector('link[rel="icon"]')?.getAttribute("href") ||
      document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute("href") ||
      "";

    // Try to find a logo image
    if (!logoUrl) {
      const imgs = Array.from(document.querySelectorAll("img"));
      const logoImg = imgs.find(
        (img) =>
          img.alt?.toLowerCase().includes("logo") ||
          img.src?.toLowerCase().includes("logo") ||
          img.className?.toLowerCase().includes("logo")
      );
      if (logoImg) logoUrl = logoImg.src;
    }

    // Make relative URLs absolute
    if (logoUrl && !logoUrl.startsWith("http")) {
      logoUrl = new URL(logoUrl, window.location.origin).href;
    }

    return { name, description, logoUrl };
  });
}

interface BrandAnalysis {
  tone: ToneProfile;
  audience: AudienceProfile;
  industry: string;
  category: string;
  keywords: string[];
}

async function analyzeBrandWithLLM(
  name: string,
  description: string,
  pageText: string,
  url: string
): Promise<BrandAnalysis> {
  const prompt = `Analyze this brand and return a JSON object. Do not include any text outside the JSON.

Brand: ${name}
URL: ${url}
Description: ${description}
Page Content (excerpt): ${pageText.slice(0, 3000)}

Return this exact JSON structure:
{
  "tone": {
    "primary": "<one of: formal, casual, playful, professional, authoritative, friendly, inspirational, technical, luxurious, minimalist>",
    "secondary": "<same options as primary>",
    "description": "<2-sentence description of their communication style>",
    "formality": <0-100>,
    "energy": <0-100>,
    "warmth": <0-100>
  },
  "audience": {
    "primary": "<primary target audience in one phrase>",
    "secondary": "<secondary audience>",
    "ageRange": "<e.g. 25-45>",
    "interests": ["<interest1>", "<interest2>", "<interest3>"],
    "painPoints": ["<pain point 1>", "<pain point 2>"]
  },
  "industry": "<industry name>",
  "category": "<specific category within industry>",
  "keywords": ["<keyword1>", "<keyword2>", "<keyword3>", "<keyword4>", "<keyword5>"]
}`;

  try {
    return await generateJSON<BrandAnalysis>([
      {
        role: "system",
        content:
          "You are a brand analyst. Analyze brands and return structured JSON. Be specific and insightful.",
      },
      { role: "user", content: prompt },
    ], { json: true });
  } catch {
    // Fallback if LLM fails
    return {
      tone: {
        primary: "professional",
        secondary: "friendly",
        description: "A professional and approachable tone.",
        formality: 60,
        energy: 50,
        warmth: 60,
      },
      audience: {
        primary: "General consumers",
        secondary: "Business professionals",
        ageRange: "25-55",
        interests: ["technology", "innovation"],
        painPoints: ["efficiency", "reliability"],
      },
      industry: "Technology",
      category: "General",
      keywords: [name.toLowerCase(), "brand", "business"],
    };
  }
}
