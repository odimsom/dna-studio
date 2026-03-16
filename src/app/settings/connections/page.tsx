"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
  Settings,
  Cpu,
  Key,
} from "lucide-react";

const socialPlatforms = [
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "from-pink-500 to-purple-600",
    description: "Connect your Instagram Business account",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "from-blue-500 to-blue-600",
    description: "Connect your Facebook Page",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "from-blue-600 to-blue-700",
    description: "Connect your LinkedIn profile",
  },
  {
    id: "twitter",
    name: "X / Twitter",
    icon: Twitter,
    color: "from-sky-400 to-sky-500",
    description: "Connect your X account",
  },
];

const llmProviders = [
  { id: "openai", name: "OpenAI", model: "GPT-4o" },
  { id: "anthropic", name: "Anthropic", model: "Claude Sonnet" },
  { id: "gemini", name: "Google Gemini", model: "Gemini 1.5 Pro" },
  { id: "ollama", name: "Ollama (Local)", model: "Llama 3.1" },
];

export default function SettingsPage() {
  const [selectedProvider, setSelectedProvider] = useState(
    process.env.NEXT_PUBLIC_LLM_PROVIDER || "openai"
  );

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-10">
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-2">
            Settings
          </h1>
          <p className="text-muted text-sm">
            Manage your social connections and AI provider settings.
          </p>
        </div>

        {/* Social Connections */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            Social Connections
          </h2>
          <div className="space-y-4">
            {socialPlatforms.map((platform) => (
              <Card
                key={platform.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center`}
                  >
                    <platform.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{platform.name}</h3>
                    <p className="text-xs text-muted">{platform.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge>Not Connected</Badge>
                  <Button size="sm" variant="secondary">
                    Connect
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* LLM Provider */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            AI Provider
          </h2>
          <Card className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {llmProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`p-4 rounded-xl border transition-all text-left cursor-pointer ${
                    selectedProvider === provider.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background hover:bg-card-hover"
                  }`}
                >
                  <p className="font-medium text-sm">{provider.name}</p>
                  <p className="text-xs text-muted mt-0.5">{provider.model}</p>
                </button>
              ))}
            </div>

            {selectedProvider !== "ollama" && (
              <div className="pt-2">
                <Input
                  id="api-key"
                  label={
                    <span className="flex items-center gap-1.5">
                      <Key className="w-3 h-3" /> API Key
                    </span> as unknown as string
                  }
                  type="password"
                  placeholder="sk-..."
                />
                <p className="text-xs text-muted mt-2">
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
      </div>
    </AppShell>
  );
}
