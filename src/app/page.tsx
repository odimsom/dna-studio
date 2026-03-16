"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dna,
  Globe,
  Palette,
  Megaphone,
  Github,
  ArrowRight,
  Check,
  Sparkles,
  Camera,
} from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Brand DNA Extraction",
    description:
      "Paste any URL. We crawl it and extract colors, fonts, tone, audience, and more — automatically.",
  },
  {
    icon: Palette,
    title: "Model-Agnostic AI",
    description:
      "Works with OpenAI, Anthropic, Google Gemini, or local models via Ollama. Your choice.",
  },
  {
    icon: Megaphone,
    title: "Multi-Platform Content",
    description:
      "Generate platform-specific content for Instagram, LinkedIn, Facebook, and X — all at once.",
  },
  {
    icon: Camera,
    title: "AI Photoshoot",
    description:
      "Generate professional product shots and on-brand visuals without a traditional photoshoot.",
  },
  {
    icon: Sparkles,
    title: "Multi-Language",
    description:
      "Generate content in any language. Perfect for global brands and multilingual campaigns.",
  },
  {
    icon: Dna,
    title: "Self-Hosted",
    description:
      "One command to deploy. Your data stays yours. No vendor lock-in. MIT licensed.",
  },
];

const comparison = [
  { feature: "Self-hosted", dnaStudio: true, pomelli: false, canva: false },
  { feature: "Model-agnostic", dnaStudio: true, pomelli: false, canva: false },
  { feature: "Brand DNA extraction", dnaStudio: true, pomelli: true, canva: false },
  { feature: "Multi-platform generation", dnaStudio: true, pomelli: true, canva: true },
  { feature: "AI Photoshoot", dnaStudio: true, pomelli: true, canva: false },
  { feature: "Multi-language", dnaStudio: true, pomelli: false, canva: true },
  { feature: "Open source", dnaStudio: true, pomelli: false, canva: false },
  { feature: "Free tier", dnaStudio: true, pomelli: false, canva: true },
];

export default function LandingPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <Dna className="w-3.5 h-3.5 text-background" />
            </div>
            <span className="text-sm font-semibold tracking-tight">DNA Studio</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              Star
            </a>
            <Button size="sm" onClick={() => router.push("/login")}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent-muted text-accent text-xs mb-8">
              <Sparkles className="w-3 h-3" />
              Open Source AI Marketing Platform
            </div>

            <h1 className="text-5xl md:text-7xl font-[family-name:var(--font-heading)] italic leading-[1.1] tracking-tight mb-6">
              Your Brand.{" "}
              <span className="text-accent">
                Everywhere.
              </span>{" "}
              Instantly.
            </h1>

            <p className="text-base text-muted max-w-xl mx-auto mb-10 leading-relaxed">
              Extract your Brand DNA from any website. Generate on-brand content
              for every social platform. Publish directly. Self-hosted, model-agnostic,
              and open source.
            </p>
          </motion.div>

          {/* URL Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-xl mx-auto"
          >
            <div className="flex gap-2 p-2 rounded-xl border border-border bg-card">
              <div className="flex-1 flex items-center gap-3 px-4">
                <Globe className="w-4 h-4 text-muted" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-website.com"
                  className="w-full bg-transparent text-foreground placeholder:text-muted/30 focus:outline-none text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && url) {
                      router.push(`/login?redirect=/brands/new&url=${encodeURIComponent(url)}`);
                    }
                  }}
                />
              </div>
              <Button
                onClick={() =>
                  router.push(
                    `/login?redirect=/brands/new&url=${encodeURIComponent(url)}`
                  )
                }
                disabled={!url}
              >
                Analyze Brand
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-[family-name:var(--font-heading)] italic mb-3">
              Everything you need for AI-powered marketing
            </h2>
            <p className="text-sm text-muted max-w-lg mx-auto">
              From brand analysis to content generation to direct publishing —
              all in one self-hosted platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="p-6 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-accent/15 transition-all duration-300"
              >
                <feature.icon className="w-5 h-5 text-accent mb-4" />
                <h3 className="text-sm font-semibold mb-1.5">{feature.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24 px-6 border-t border-border/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-[family-name:var(--font-heading)] italic mb-3">
              How DNA Studio compares
            </h2>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-card">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted">
                    Feature
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-accent">
                    DNA Studio
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-muted">
                    Pomelli
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-muted">
                    Canva AI
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr
                    key={row.feature}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="px-5 py-3 text-xs">{row.feature}</td>
                    <td className="px-5 py-3 text-center">
                      {row.dnaStudio ? (
                        <Check className="w-3.5 h-3.5 text-success mx-auto" />
                      ) : (
                        <span className="text-muted/20">&mdash;</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {row.pomelli ? (
                        <Check className="w-3.5 h-3.5 text-muted/50 mx-auto" />
                      ) : (
                        <span className="text-muted/20">&mdash;</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {row.canva ? (
                        <Check className="w-3.5 h-3.5 text-muted/50 mx-auto" />
                      ) : (
                        <span className="text-muted/20">&mdash;</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-border/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-[family-name:var(--font-heading)] italic mb-4">
            Ready to decode your brand?
          </h2>
          <p className="text-sm text-muted mb-8 max-w-md mx-auto">
            Deploy DNA Studio in one command. Self-hosted, open source, and free forever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="bg-card border border-border rounded-lg px-5 py-2.5 font-mono text-xs text-foreground/70">
              docker compose up -d
            </div>
            <Button onClick={() => router.push("/login")}>
              Get Started Free
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-1.5">
            <Dna className="w-3 h-3 text-accent" />
            DNA Studio
          </div>
          <p>MIT License</p>
        </div>
      </footer>
    </div>
  );
}
