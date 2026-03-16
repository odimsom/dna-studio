"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Globe,
  Palette,
  Megaphone,
  Send,
  Github,
  ArrowRight,
  Check,
  Sparkles,
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
    icon: Send,
    title: "Direct Publishing",
    description:
      "Connect your social accounts and publish or schedule posts directly from BrandForge.",
  },
  {
    icon: Sparkles,
    title: "Multi-Language",
    description:
      "Generate content in any language. Perfect for global brands and multilingual campaigns.",
  },
  {
    icon: Zap,
    title: "Self-Hosted",
    description:
      "One command to deploy. Your data stays yours. No vendor lock-in. MIT licensed.",
  },
];

const comparison = [
  { feature: "Self-hosted", brandforge: true, pomelli: false, canva: false },
  { feature: "Model-agnostic", brandforge: true, pomelli: false, canva: false },
  { feature: "Brand DNA extraction", brandforge: true, pomelli: true, canva: false },
  { feature: "Multi-platform generation", brandforge: true, pomelli: true, canva: true },
  { feature: "Direct social publishing", brandforge: true, pomelli: false, canva: true },
  { feature: "Multi-language", brandforge: true, pomelli: false, canva: true },
  { feature: "Open source", brandforge: true, pomelli: false, canva: false },
  { feature: "Free tier", brandforge: true, pomelli: false, canva: true },
];

export default function LandingPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">BrandForge</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
              Star on GitHub
            </a>
            <Button size="sm" onClick={() => router.push("/login")}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              Open Source AI Marketing Platform
            </div>

            <h1 className="text-5xl md:text-7xl font-bold font-[family-name:var(--font-heading)] leading-[1.1] tracking-tight mb-6">
              Your Brand.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                Everywhere.
              </span>{" "}
              Instantly.
            </h1>

            <p className="text-lg text-muted max-w-2xl mx-auto mb-10">
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
            <div className="flex gap-2 p-2 rounded-2xl border border-border bg-card">
              <div className="flex-1 flex items-center gap-3 px-4">
                <Globe className="w-4 h-4 text-muted" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-website.com"
                  className="w-full bg-transparent text-foreground placeholder:text-muted/40 focus:outline-none text-sm"
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
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] mb-4">
              Everything you need for AI-powered marketing
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              From brand analysis to content generation to direct publishing —
              all in one self-hosted platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="p-6 rounded-2xl border border-border bg-card/50 hover:bg-card hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 px-6 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] mb-4">
              How BrandForge compares
            </h2>
          </div>

          <div className="rounded-2xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-card">
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-primary">
                    BrandForge
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-muted">
                    Pomelli
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-muted">
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
                    <td className="px-6 py-3 text-sm">{row.feature}</td>
                    <td className="px-6 py-3 text-center">
                      {row.brandforge ? (
                        <Check className="w-4 h-4 text-success mx-auto" />
                      ) : (
                        <span className="text-muted/30">&mdash;</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {row.pomelli ? (
                        <Check className="w-4 h-4 text-muted mx-auto" />
                      ) : (
                        <span className="text-muted/30">&mdash;</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {row.canva ? (
                        <Check className="w-4 h-4 text-muted mx-auto" />
                      ) : (
                        <span className="text-muted/30">&mdash;</span>
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
      <section className="py-20 px-6 border-t border-border/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] mb-6">
            Ready to forge your brand?
          </h2>
          <p className="text-muted mb-8 max-w-xl mx-auto">
            Deploy BrandForge in one command. Self-hosted, open source, and free forever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="bg-card border border-border rounded-xl px-6 py-3 font-mono text-sm text-foreground">
              docker compose up -d
            </div>
            <Button size="lg" onClick={() => router.push("/login")}>
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-primary" />
            BrandForge
          </div>
          <p>MIT License</p>
        </div>
      </footer>
    </div>
  );
}
