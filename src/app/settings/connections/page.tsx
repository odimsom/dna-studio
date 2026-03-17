"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
  Settings,
  Cpu,
  Key,
  Image as ImageIcon,
} from "lucide-react";

const socialPlatforms = [
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    description: "Connect your Instagram Business account",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    description: "Connect your Facebook Page",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    description: "Connect your LinkedIn profile",
  },
  {
    id: "twitter",
    name: "X / Twitter",
    icon: Twitter,
    description: "Connect your X account",
  },
];

const llmProviders = [
  { id: "openai", name: "OpenAI", model: "GPT-4o" },
  { id: "anthropic", name: "Anthropic", model: "Claude Sonnet" },
  { id: "gemini", name: "Google Gemini", model: "Gemini 1.5 Pro" },
  { id: "ollama", name: "Ollama (Local)", model: "Llama 3.1" },
];

const imageProviders = [
  {
    id: "openai",
    name: "OpenAI DALL-E 3",
    description: "High quality, follows instructions well",
    envKey: "OPENAI_API_KEY",
    placeholder: "sk-...",
  },
  {
    id: "stability",
    name: "Stability AI",
    description: "Stable Diffusion 3.5 — fast & flexible",
    envKey: "STABILITY_API_KEY",
    placeholder: "sk-...",
  },
  {
    id: "replicate",
    name: "Replicate (Flux)",
    description: "Flux Schnell — open weights via Replicate",
    envKey: "REPLICATE_API_TOKEN",
    placeholder: "r8_...",
  },
];

export default function SettingsPage() {
  const [selectedProvider, setSelectedProvider] = useState(
    process.env.NEXT_PUBLIC_LLM_PROVIDER || "openai"
  );
  const [selectedImageProvider, setSelectedImageProvider] = useState(
    process.env.NEXT_PUBLIC_IMAGE_PROVIDER || "openai"
  );

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Settings className="w-6 h-6 text-accent mx-auto mb-4" />
          <h1 className="text-3xl font-[family-name:var(--font-heading)] italic mb-2">
            Settings
          </h1>
          <p className="text-sm text-muted">
            Manage your social connections and AI provider settings.
          </p>
        </div>

        <div className="space-y-10">
          {/* Social Connections */}
          <section>
            <h2 className="text-sm font-medium text-muted mb-4">
              Social Connections
            </h2>
            <div className="space-y-3">
              {socialPlatforms.map((platform) => (
                <Card
                  key={platform.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <platform.icon className="w-5 h-5 text-muted" />
                    <div>
                      <h3 className="text-sm font-medium">{platform.name}</h3>
                      <p className="text-xs text-muted">{platform.description}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="secondary">
                    Connect
                  </Button>
                </Card>
              ))}
            </div>
          </section>

          {/* LLM Provider */}
          <section>
            <h2 className="text-sm font-medium text-muted mb-4">
              AI Provider
            </h2>
            <Card className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {llmProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider.id)}
                    className={`p-4 rounded-lg border transition-all text-left cursor-pointer ${
                      selectedProvider === provider.id
                        ? "border-accent bg-accent-muted"
                        : "border-border bg-surface hover:bg-card-hover"
                    }`}
                  >
                    <p className="text-sm font-medium">{provider.name}</p>
                    <p className="text-xs text-muted mt-0.5">{provider.model}</p>
                  </button>
                ))}
              </div>

              {selectedProvider !== "ollama" && (
                <div className="pt-2">
                  <Input
                    id="api-key"
                    label="API Key"
                    type="password"
                    placeholder="sk-..."
                  />
                  <p className="text-[10px] text-muted mt-2">
                    API keys are stored in your environment variables. Update your
                    .env file or Docker compose configuration.
                  </p>
                </div>
              )}

              {selectedProvider === "ollama" && (
                <div className="pt-2">
                  <Input
                    id="ollama-url"
                    label="Ollama URL"
                    type="url"
                    placeholder="http://localhost:11434"
                    defaultValue="http://localhost:11434"
                  />
                </div>
              )}
            </Card>
          </section>

          {/* Image Generation Provider */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-3.5 h-3.5 text-muted" />
              <h2 className="text-sm font-medium text-muted">
                Image Generation
              </h2>
            </div>
            <Card className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {imageProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => setSelectedImageProvider(provider.id)}
                    className={`p-4 rounded-lg border transition-all text-left cursor-pointer ${
                      selectedImageProvider === provider.id
                        ? "border-accent bg-accent-muted"
                        : "border-border bg-surface hover:bg-card-hover"
                    }`}
                  >
                    <p className="text-sm font-medium">{provider.name}</p>
                    <p className="text-xs text-muted mt-0.5">{provider.description}</p>
                  </button>
                ))}
              </div>

              {imageProviders
                .filter((p) => p.id === selectedImageProvider)
                .map((p) => (
                  <div key={p.id} className="pt-2 space-y-2">
                    <Input
                      id={`image-key-${p.id}`}
                      label={p.envKey}
                      type="password"
                      placeholder={p.placeholder}
                    />
                    <p className="text-[10px] text-muted">
                      Set <code className="font-mono">IMAGE_PROVIDER={p.id}</code> and{" "}
                      <code className="font-mono">{p.envKey}</code> in your{" "}
                      <code className="font-mono">.env</code> or Docker Compose config.
                    </p>
                  </div>
                ))}
            </Card>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
