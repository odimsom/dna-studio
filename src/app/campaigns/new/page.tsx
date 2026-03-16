"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Megaphone,
  ArrowRight,
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
  Loader2,
} from "lucide-react";

interface Brand {
  id: string;
  name: string;
  colors: string[];
  logoUrl: string | null;
}

const platforms = [
  { id: "instagram", label: "Instagram", icon: Instagram, color: "from-pink-500 to-purple-600" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "from-blue-600 to-blue-700" },
  { id: "facebook", label: "Facebook", icon: Facebook, color: "from-blue-500 to-blue-600" },
  { id: "twitter", label: "X / Twitter", icon: Twitter, color: "from-sky-400 to-sky-500" },
];

const languages = [
  "English", "Spanish", "French", "German", "Arabic", "Chinese",
  "Japanese", "Portuguese", "Hindi", "Korean", "Italian", "Dutch",
];

export default function NewCampaignPage() {
  return (
    <Suspense>
      <NewCampaignContent />
    </Suspense>
  );
}

function NewCampaignContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedBrandId = searchParams.get("brandId") || "";

  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandId, setBrandId] = useState(preselectedBrandId);
  const [goal, setGoal] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "instagram",
    "linkedin",
  ]);
  const [language, setLanguage] = useState("English");
  const [generating, setGenerating] = useState(false);
  const [streamContent, setStreamContent] = useState("");

  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((data) => {
        setBrands(Array.isArray(data) ? data : []);
      });
  }, []);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleGenerate = useCallback(async () => {
    if (!brandId || !goal || selectedPlatforms.length === 0) return;

    setGenerating(true);
    setStreamContent("");

    try {
      const response = await fetch("/api/campaigns/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          goal,
          platforms: selectedPlatforms,
          language,
        }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = JSON.parse(line.slice(6));

          if (data.type === "chunk") {
            setStreamContent((prev) => prev + data.content);
          } else if (data.type === "complete") {
            router.push(`/campaigns/${data.campaign.id}`);
            return;
          } else if (data.type === "error") {
            throw new Error(data.message);
          }
        }
      }
    } catch (err) {
      console.error("Generation failed:", err);
      setGenerating(false);
    }
  }, [brandId, goal, selectedPlatforms, language, router]);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {!generating ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-6">
                  <Megaphone className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-2">
                  Create Campaign
                </h1>
                <p className="text-muted">
                  Generate on-brand content for your social platforms.
                </p>
              </div>

              <Card className="p-8 space-y-6">
                {/* Brand selector */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-muted">
                    Brand
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {brands.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => setBrandId(brand.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          brandId === brand.id
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:bg-card-hover"
                        }`}
                      >
                        {brand.logoUrl ? (
                          <img
                            src={brand.logoUrl}
                            alt={brand.name}
                            className="w-8 h-8 rounded-lg object-cover bg-white"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                            {brand.name.charAt(0)}
                          </div>
                        )}
                        <span className="text-sm font-medium">{brand.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Goal */}
                <Input
                  id="goal"
                  label="Campaign Goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder='e.g., "Promote summer sale", "Announce new product", "Grow followers"'
                />

                {/* Platforms */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-muted">
                    Platforms
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {platforms.map((platform) => (
                      <button
                        key={platform.id}
                        onClick={() => togglePlatform(platform.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          selectedPlatforms.includes(platform.id)
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:bg-card-hover"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center`}
                        >
                          <platform.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">
                          {platform.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-muted">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={
                    !brandId || !goal || selectedPlatforms.length === 0
                  }
                >
                  Generate Campaign
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="generating"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] mb-2">
                  Generating Campaign
                </h2>
                <p className="text-muted text-sm">
                  Creating on-brand content for {selectedPlatforms.length}{" "}
                  platform{selectedPlatforms.length !== 1 ? "s" : ""}...
                </p>
              </div>

              <Card className="p-6 max-h-[400px] overflow-y-auto">
                <pre className="text-xs text-muted whitespace-pre-wrap font-mono">
                  {streamContent || "Starting generation..."}
                </pre>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
