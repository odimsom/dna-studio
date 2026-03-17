"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Megaphone,
  ArrowRight,
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
  Loader2,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

interface Brand {
  id: string;
  name: string;
  colors: string[];
  logoUrl: string | null;
}

const platforms = [
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "facebook", label: "Facebook", icon: Facebook },
  { id: "twitter", label: "X", icon: Twitter },
];

const suggestions = [
  "Launch a new product announcement campaign",
  "Promote a seasonal sale with urgency",
  "Build brand awareness and grow followers",
  "Share a customer success story",
  "Announce a company milestone or update",
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
  const [error, setError] = useState("");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setBrands(list);
        if (!preselectedBrandId && list.length > 0) {
          setBrandId(list[0].id);
        }
      });
  }, [preselectedBrandId]);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleGenerate = useCallback(async () => {
    if (!brandId || !goal || selectedPlatforms.length === 0) return;

    setGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/campaigns/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          goal,
          platforms: selectedPlatforms,
          language,
          referenceImageUrl: referenceImage ?? undefined,
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

          if (data.type === "complete") {
            router.push(`/campaigns/${data.campaign.id}`);
            return;
          } else if (data.type === "error") {
            throw new Error(data.message);
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      console.error("Generation failed:", msg);
      setError(msg);
      setGenerating(false);
    }
  }, [brandId, goal, selectedPlatforms, language, router]);

  const activeBrand = brands.find((b) => b.id === brandId);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {!generating ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Header */}
              <div className="text-center mb-10">
                <Megaphone className="w-6 h-6 text-accent mx-auto mb-4" />
                <h1 className="text-3xl font-[family-name:var(--font-heading)] italic mb-2">
                  Campaigns
                </h1>
                <p className="text-sm text-muted">
                  Start from our suggestions or prompt to create a new campaign.
                </p>
              </div>

              {/* Natural language input */}
              {/* Reference image upload */}
              <div className="mb-4">
                <p className="text-xs text-muted mb-2">Reference image <span className="text-muted/50">(optional — logo, product, or brand visual)</span></p>
                {referenceImage ? (
                  <div className="relative inline-flex">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={referenceImage} alt="Reference" className="h-16 w-auto rounded-lg border border-border object-cover" />
                    <button
                      onClick={() => setReferenceImage(null)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center hover:bg-card-hover cursor-pointer"
                    >
                      <X className="w-3 h-3 text-muted" />
                    </button>
                  </div>
                ) : (
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border hover:border-accent/30 text-xs text-muted hover:text-foreground transition-colors cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    Upload image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => setReferenceImage(reader.result as string);
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                )}
              </div>

              <Card className="p-6 mb-8">
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Describe the campaign you want to create"
                  className="w-full bg-transparent text-foreground placeholder:text-muted/30 focus:outline-none resize-none text-base min-h-[60px]"
                  rows={2}
                />
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="flex gap-2">
                    {/* Brand selector pill */}
                    {activeBrand && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs">
                        <div
                          className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
                          style={{
                            backgroundColor: activeBrand.colors[0] || "#C9A96E",
                          }}
                        />
                        {activeBrand.name}
                      </div>
                    )}

                    {/* Platform pills */}
                    {platforms.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => togglePlatform(p.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer border ${
                          selectedPlatforms.includes(p.id)
                            ? "bg-accent-muted border-accent/20 text-accent"
                            : "bg-surface border-border text-muted hover:text-foreground"
                        }`}
                      >
                        <p.icon className="w-3 h-3" />
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    onClick={handleGenerate}
                    disabled={!brandId || !goal || selectedPlatforms.length === 0}
                  >
                    <Sparkles className="w-3 h-3" />
                    Generate
                  </Button>
                </div>
              </Card>

              {/* Suggestions */}
              <div className="mb-10">
                <h3 className="text-sm font-medium text-muted mb-4">
                  Suggestions based on Business DNA
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setGoal(suggestion)}
                      className="text-left px-4 py-3 rounded-lg border border-border bg-card hover:bg-card-hover hover:border-accent/20 transition-all text-sm text-foreground/70 cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings row */}
              <div className="flex items-center gap-4">
                {brands.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">Brand:</span>
                    <select
                      value={brandId}
                      onChange={(e) => setBrandId(e.target.value)}
                      className="text-xs bg-surface border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none"
                    >
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">Language:</span>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="text-xs bg-surface border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none"
                  >
                    {["English", "Spanish", "French", "German", "Arabic", "Chinese", "Japanese", "Portuguese", "Hindi", "Korean"].map(
                      (lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="generating"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {error ? (
                <div className="text-center py-12">
                  <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-5 h-5 text-danger" />
                  </div>
                  <h2 className="text-xl font-[family-name:var(--font-heading)] italic mb-2">
                    Generation failed
                  </h2>
                  <p className="text-sm text-danger/80 max-w-md mx-auto mb-6">{error}</p>
                  <Button variant="secondary" onClick={() => { setGenerating(false); setError(""); }}>
                    Try Again
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <Loader2 className="w-5 h-5 text-accent animate-spin mx-auto mb-3" />
                    <h2 className="text-xl font-[family-name:var(--font-heading)] italic mb-1">
                      Creating your campaign
                    </h2>
                    <p className="text-xs text-muted">
                      Writing copy for {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? "s" : ""}…
                    </p>
                  </div>

                  {/* Skeleton asset cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(selectedPlatforms.length * 2)].map((_, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border border-border/50">
                        <div
                          className="aspect-[4/5] bg-card animate-pulse"
                          style={{ animationDelay: `${i * 120}ms` }}
                        />
                        <div className="p-4 space-y-2.5">
                          <div className="h-2.5 bg-card-hover rounded animate-pulse w-3/4" style={{ animationDelay: `${i * 120 + 60}ms` }} />
                          <div className="h-2.5 bg-card-hover rounded animate-pulse w-full" style={{ animationDelay: `${i * 120 + 80}ms` }} />
                          <div className="h-2.5 bg-card-hover rounded animate-pulse w-2/3" style={{ animationDelay: `${i * 120 + 100}ms` }} />
                          <div className="flex gap-1.5 mt-3">
                            <div className="h-4 w-16 bg-card-hover rounded animate-pulse" />
                            <div className="h-4 w-20 bg-card-hover rounded animate-pulse" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
