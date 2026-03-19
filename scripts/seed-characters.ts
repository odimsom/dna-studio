/**
 * Seed UGC Characters with Veo-generated preview videos.
 *
 * Usage:
 *   npx tsx scripts/seed-characters.ts
 *
 * Requires:
 *   - GOOGLE_API_KEY env var (or pass as first argument)
 *   - DATABASE_URL env var
 *
 * This script:
 *   1. Inserts 12 diverse AI characters into the UGCCharacter table
 *   2. Generates a preview video for each via Veo (veo-3.1-generate-preview)
 *   3. Polls until all videos complete
 *   4. Downloads videos to public/ugc/{name}.mp4
 *   5. Updates each character record with the local path
 */

import { PrismaClient } from "@prisma/client";
import { writeFileSync, existsSync } from "fs";
import { join } from "path";

const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta";
const PUBLIC_UGC_DIR = join(process.cwd(), "public", "ugc");

const prisma = new PrismaClient();

const CHARACTERS = [
  {
    name: "Sofia",
    gender: "female",
    style: "Friendly & Warm",
    description:
      "young woman in her mid-20s with warm brown skin, long dark wavy hair, wearing a cozy cream knit sweater, natural makeup with a bright smile",
    previewPrompt:
      "Close-up selfie video of a young woman in her mid-20s with warm brown skin, long dark wavy hair, wearing a cozy cream knit sweater. She smiles warmly at the camera and waves hello, natural daylight from a window, casual apartment setting. Authentic UGC style, slight phone camera movement.",
  },
  {
    name: "Marcus",
    gender: "male",
    style: "Professional",
    description:
      "confident Black man in his early 30s with a clean fade haircut, well-groomed short beard, wearing a fitted navy polo shirt",
    previewPrompt:
      "Close-up selfie video of a confident Black man in his early 30s with a clean fade haircut and short beard, wearing a fitted navy polo. He nods at the camera and starts speaking enthusiastically, modern home office background with a bookshelf. Professional but casual UGC feel.",
  },
  {
    name: "Luna",
    gender: "female",
    style: "Energetic & Gen-Z",
    description:
      "energetic young woman in her early 20s with dyed pastel pink hair in a messy bun, multiple ear piercings, wearing an oversized graphic tee",
    previewPrompt:
      "Close-up selfie video of an energetic young woman in her early 20s with pastel pink hair in a messy bun, multiple ear piercings, oversized graphic tee. She makes an excited expression and gestures at the camera, colorful bedroom background with fairy lights. High-energy TikTok creator vibe.",
  },
  {
    name: "James",
    gender: "male",
    style: "Casual Dad",
    description:
      "friendly man in his late 30s with light brown hair and a scruffy beard, wearing a flannel shirt with rolled sleeves, kind eyes",
    previewPrompt:
      "Close-up selfie video of a friendly man in his late 30s with light brown hair and scruffy beard, wearing a flannel shirt. He gives a relaxed smile and points at the camera as if saying 'you need to hear this', kitchen background with natural light. Authentic casual dad energy.",
  },
  {
    name: "Aria",
    gender: "female",
    style: "Luxury & Glam",
    description:
      "elegant woman in her late 20s with sleek straight black hair, flawless dewy skin, subtle gold jewelry, wearing a silk blouse",
    previewPrompt:
      "Close-up selfie video of an elegant woman in her late 20s with sleek straight black hair, dewy skin, subtle gold earrings, wearing a cream silk blouse. She tilts her head with a knowing smile and raises one eyebrow, minimalist white marble bathroom background. Luxury beauty influencer aesthetic.",
  },
  {
    name: "Kai",
    gender: "male",
    style: "Tech Reviewer",
    description:
      "Asian man in his late 20s with short black hair, slim black-framed glasses, wearing a clean dark grey crewneck, sharp features",
    previewPrompt:
      "Close-up selfie video of an Asian man in his late 20s with short black hair and slim black glasses, wearing a dark grey crewneck. He looks impressed and raises his eyebrows while nodding approvingly, modern desk with monitors and tech gear in the background. Tech reviewer YouTube feel.",
  },
  {
    name: "Maya",
    gender: "female",
    style: "Wellness & Natural",
    description:
      "serene woman in her early 30s with natural curly auburn hair, freckles, minimal no-makeup look, wearing a linen tank top",
    previewPrompt:
      "Close-up selfie video of a serene woman in her early 30s with natural curly auburn hair, freckles, minimal makeup, linen tank top. She takes a deep breath and speaks calmly with genuine warmth, bright airy room with plants in the background. Wellness and clean-living creator aesthetic.",
  },
  {
    name: "Alex",
    gender: "male",
    style: "Fitness & Active",
    description:
      "athletic man in his mid-20s with short curly dark hair, tan skin, athletic build, wearing a fitted dri-fit shirt",
    previewPrompt:
      "Close-up selfie video of an athletic man in his mid-20s with short curly dark hair, tan skin, wearing a fitted performance shirt. He wipes his forehead as if finishing a workout and speaks excitedly to camera, gym or outdoor park background. Energetic fitness creator vibe.",
  },
  {
    name: "Chloe",
    gender: "female",
    style: "Beauty & Skincare",
    description:
      "young woman in her early 20s with fair skin, straight blonde bob haircut, soft glam makeup with winged eyeliner, wearing a pink off-shoulder top",
    previewPrompt:
      "Close-up selfie video of a young woman in her early 20s with fair skin, blonde bob haircut, soft glam makeup, pink off-shoulder top. She touches her cheek admiringly and leans into the camera sharing a secret, vanity mirror with ring light in background. Beauty creator get-ready-with-me aesthetic.",
  },
  {
    name: "Omar",
    gender: "male",
    style: "Storyteller",
    description:
      "charismatic Middle Eastern man in his early 30s with a trimmed dark beard, warm brown eyes, wearing a casual olive henley shirt",
    previewPrompt:
      "Close-up selfie video of a charismatic Middle Eastern man in his early 30s with trimmed dark beard, warm eyes, olive henley shirt. He leans forward conspiratorially and starts telling a story with animated hand gestures, cozy living room with warm lighting. Natural storyteller energy.",
  },
  {
    name: "Zara",
    gender: "female",
    style: "Fashion-Forward",
    description:
      "stylish young Black woman in her mid-20s with short cropped natural hair, bold red lipstick, statement earrings, wearing a structured blazer over a crop top",
    previewPrompt:
      "Close-up selfie video of a stylish young Black woman in her mid-20s with short cropped natural hair, bold red lips, statement earrings, structured blazer over crop top. She strikes a quick pose then transitions to speaking confidently, trendy cafe or studio background. Fashion influencer energy.",
  },
  {
    name: "Noah",
    gender: "male",
    style: "Everyday & Relatable",
    description:
      "approachable man in his late 20s with messy sandy brown hair, slight stubble, wearing a simple white t-shirt, boy-next-door vibe",
    previewPrompt:
      "Close-up selfie video of an approachable man in his late 20s with messy sandy brown hair, slight stubble, plain white t-shirt. He laughs naturally and starts talking like he's chatting with a friend, casual bedroom or living room background. Genuine relatable everyday creator.",
  },
];

async function startGeneration(apiKey: string, prompt: string) {
  const res = await fetch(
    `${GEMINI_API}/models/veo-3.1-generate-preview:predictLongRunning`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          aspectRatio: "9:16",
          personGeneration: "allow_all",
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Veo error: ${(err as { error?: { message?: string } }).error?.message || res.status}`
    );
  }

  const data = await res.json();
  return data.name as string;
}

/**
 * Poll and return the raw file URI (without any download params or API key).
 */
async function pollOperation(
  apiKey: string,
  operationName: string
): Promise<{ done: boolean; fileUri: string | null }> {
  const res = await fetch(`${GEMINI_API}/${operationName}`, {
    headers: { "x-goog-api-key": apiKey },
  });

  if (!res.ok) return { done: false, fileUri: null };

  const data = await res.json();

  if (data.done) {
    const samples = data.response?.generateVideoResponse?.generatedSamples;
    const videoUri = samples?.[0]?.video?.uri;
    return { done: true, fileUri: videoUri || null };
  }

  return { done: false, fileUri: null };
}

/**
 * Download a video from the Gemini Files API and save to public/ugc/.
 * The download endpoint returns a 302 redirect, so we need to follow it.
 */
async function downloadVideo(
  apiKey: string,
  fileUri: string,
  filename: string
): Promise<string> {
  // fileUri looks like: https://generativelanguage.googleapis.com/v1beta/files/XXXX
  // Download URL: {fileUri}:download?alt=media (note the colon before download)
  const fileId = fileUri.split("/files/")[1];
  const downloadUrl = `${GEMINI_API}/files/${fileId}:download?alt=media`;

  // fetch() follows redirects by default
  const res = await fetch(downloadUrl, {
    headers: { "x-goog-api-key": apiKey },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`Download failed: ${res.status}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const filePath = join(PUBLIC_UGC_DIR, filename);
  writeFileSync(filePath, buffer);

  // Return the public URL path (relative to public/)
  return `/ugc/${filename}`;
}

async function main() {
  const apiKey = process.argv[2] || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("Error: GOOGLE_API_KEY is required. Set env var or pass as argument.");
    process.exit(1);
  }

  // Ensure output directory exists
  if (!existsSync(PUBLIC_UGC_DIR)) {
    const { mkdirSync } = await import("fs");
    mkdirSync(PUBLIC_UGC_DIR, { recursive: true });
  }

  console.log("=== UGC Character Seed Script ===\n");

  // Step 1: Upsert characters into DB
  console.log("Step 1: Inserting characters into database...\n");

  const dbCharacters = [];
  for (let i = 0; i < CHARACTERS.length; i++) {
    const char = CHARACTERS[i];
    const existing = await prisma.uGCCharacter.findFirst({
      where: { name: char.name },
    });

    if (existing) {
      console.log(`  ✓ ${char.name} (already exists, id: ${existing.id})`);
      dbCharacters.push(existing);
    } else {
      const created = await prisma.uGCCharacter.create({
        data: {
          name: char.name,
          description: char.description,
          gender: char.gender,
          style: char.style,
          previewPrompt: char.previewPrompt,
          sortOrder: i,
        },
      });
      console.log(`  + ${char.name} (created, id: ${created.id})`);
      dbCharacters.push(created);
    }
  }

  // Check which characters already have local video files
  const needsPreview = dbCharacters.filter((c) => {
    const localFile = join(PUBLIC_UGC_DIR, `${c.name.toLowerCase()}.mp4`);
    if (existsSync(localFile)) {
      // File exists — make sure DB has the right path
      if (c.previewVideoUrl !== `/ugc/${c.name.toLowerCase()}.mp4`) {
        prisma.uGCCharacter
          .update({
            where: { id: c.id },
            data: { previewVideoUrl: `/ugc/${c.name.toLowerCase()}.mp4` },
          })
          .catch(() => {});
      }
      return false;
    }
    return true;
  });

  if (needsPreview.length === 0) {
    console.log("\nAll characters already have preview videos. Done!");
    await prisma.$disconnect();
    return;
  }

  console.log(
    `\nStep 2: Generating ${needsPreview.length} preview videos via Veo...\n`
  );

  // Start generations in batches of 3
  const BATCH_SIZE = 3;
  const operations: { id: string; name: string; opName: string }[] = [];

  for (let i = 0; i < needsPreview.length; i += BATCH_SIZE) {
    const batch = needsPreview.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (char) => {
        const prompt =
          CHARACTERS.find((c) => c.name === char.name)?.previewPrompt ||
          char.previewPrompt ||
          "";
        console.log(`  ▶ Starting: ${char.name}`);
        const opName = await startGeneration(apiKey, prompt);
        return { id: char.id, name: char.name, opName };
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        operations.push(result.value);
      } else {
        console.error(`  ✗ Failed to start: ${result.reason}`);
      }
    }

    if (i + BATCH_SIZE < needsPreview.length) {
      console.log("  ... waiting 5s before next batch ...");
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  if (operations.length === 0) {
    console.log("\nNo operations to poll.");
    await prisma.$disconnect();
    return;
  }

  // Step 3: Poll until all complete, then download
  console.log(`\nStep 3: Polling ${operations.length} operations...\n`);

  const pending = new Set(operations.map((o) => o.opName));
  let pollCount = 0;
  const MAX_POLLS = 60; // 5 minutes max

  while (pending.size > 0 && pollCount < MAX_POLLS) {
    await new Promise((r) => setTimeout(r, 5000));
    pollCount++;

    for (const op of operations) {
      if (!pending.has(op.opName)) continue;

      const { done, fileUri } = await pollOperation(apiKey, op.opName);

      if (done && fileUri) {
        // Download the video to public/ugc/
        try {
          const filename = `${op.name.toLowerCase()}.mp4`;
          console.log(`  ↓ Downloading: ${op.name}...`);
          const localPath = await downloadVideo(apiKey, fileUri, filename);

          await prisma.uGCCharacter.update({
            where: { id: op.id },
            data: { previewVideoUrl: localPath },
          });
          console.log(`  ✓ ${op.name}: saved to ${localPath}`);
        } catch (e) {
          console.error(`  ✗ ${op.name}: download failed — ${e}`);
        }
        pending.delete(op.opName);
      } else if (done && !fileUri) {
        console.log(`  ✗ ${op.name}: generation completed but no video returned`);
        pending.delete(op.opName);
      }
    }

    if (pending.size > 0) {
      console.log(
        `  ... ${pending.size} still processing (poll ${pollCount}/${MAX_POLLS})`
      );
    }
  }

  if (pending.size > 0) {
    console.log(
      `\n⚠ ${pending.size} videos did not complete within timeout.`
    );
    console.log(
      "Re-run the script to retry — it skips characters with existing files."
    );
  }

  console.log("\n=== Done! ===");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
