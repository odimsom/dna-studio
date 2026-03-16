"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnalysisProgress } from "@/components/brand-dna/analysis-progress";
import { DNAPreview } from "@/components/brand-dna/dna-preview";
import type { BrandDNA, CrawlProgress } from "@/lib/brand-dna/types";
import { Globe, ArrowRight, Sparkles } from "lucide-react";

type Phase = "input" | "analyzing" | "preview";

export default function NewBrandPage() {
  return (
    <Suspense>
      <NewBrandContent />
    </Suspense>
  );
}

function NewBrandContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUrl = searchParams.get("url") || "";

  const [url, setUrl] = useState(initialUrl);
  const [phase, setPhase] = useState<Phase>("input");
  const [steps, setSteps] = useState<CrawlProgress[]>([]);
  const [dna, setDna] = useState<BrandDNA | null>(null);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = useCallback(async () => {
    if (!url) return;

    setPhase("analyzing");
    setSteps([]);
    setError("");

    try {
      const response = await fetch("/api/brands/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

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

          if (data.type === "progress") {
            setSteps((prev) => {
              const existing = prev.findIndex((s) => s.step === data.step);
              if (existing >= 0) {
                const updated = [...prev];
                updated[existing] = data;
                return updated;
              }
              return [...prev, data];
            });
          } else if (data.type === "complete") {
            setDna(data.brand.dna);
            setBrandId(data.brand.id);
            setPhase("preview");
          } else if (data.type === "error") {
            setError(data.message);
            setPhase("input");
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setPhase("input");
    }
  }, [url]);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {phase === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-2">
                  Extract Brand DNA
                </h1>
                <p className="text-muted">
                  Enter a website URL and we&apos;ll analyze everything — colors,
                  fonts, tone, audience, and more.
                </p>
              </div>

              <Card className="p-8">
                <div className="flex gap-3">
                  <div className="flex-1 flex items-center gap-3 px-5 py-3 rounded-xl border border-border bg-background">
                    <Globe className="w-5 h-5 text-muted flex-shrink-0" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full bg-transparent text-foreground placeholder:text-muted/40 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAnalyze();
                      }}
                      autoFocus
                    />
                  </div>
                  <Button size="lg" onClick={handleAnalyze} disabled={!url}>
                    Analyze
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

                {error && (
                  <p className="text-sm text-danger mt-3 text-center">
                    {error}
                  </p>
                )}
              </Card>
            </motion.div>
          )}

          {phase === "analyzing" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-2">
                  Analyzing Brand DNA
                </h1>
                <p className="text-muted text-sm">{url}</p>
              </div>

              <Card className="p-8">
                <AnalysisProgress steps={steps} />
              </Card>
            </motion.div>
          )}

          {phase === "preview" && dna && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-2">
                  Brand DNA Extracted
                </h1>
                <p className="text-muted text-sm">
                  Review the analysis below. You can edit these values later.
                </p>
              </div>

              <DNAPreview dna={dna} />

              <div className="flex justify-center gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setPhase("input");
                    setDna(null);
                  }}
                >
                  Start Over
                </Button>
                <Button
                  size="lg"
                  onClick={() => router.push(`/brands/${brandId}`)}
                >
                  Looks Good, Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
