"use client";

import { useState, useEffect, useCallback } from "react";
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
  Image as ImageIcon,
  Check,
  Loader2,
} from "lucide-react";

interface SocialConnection {
  id: string;
  platform: string;
  accountName: string;
}

interface UserSettings {
  llmProvider?: string;
  llmApiKey?: string;
  llmModel?: string;
  ollamaUrl?: string;
  imageProvider?: string;
  imageApiKey?: string;
}

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
  { id: "openai", name: "OpenAI", model: "GPT-4o", keyPlaceholder: "sk-...", keyLabel: "OpenAI API Key" },
  { id: "anthropic", name: "Anthropic", model: "Claude Sonnet", keyPlaceholder: "sk-ant-...", keyLabel: "Anthropic API Key" },
  { id: "gemini", name: "Google Gemini", model: "Gemini 2.0 Flash", keyPlaceholder: "AIza...", keyLabel: "Google API Key" },
  { id: "ollama", name: "Ollama (Local)", model: "Llama 3.1", keyPlaceholder: "", keyLabel: "" },
];

const imageProviders = [
  {
    id: "openai",
    name: "OpenAI DALL-E 3",
    description: "High quality, follows instructions well",
    keyPlaceholder: "sk-...",
    keyLabel: "OpenAI API Key (shared with LLM if same)",
  },
  {
    id: "stability",
    name: "Stability AI",
    description: "Stable Diffusion 3.5 — fast & flexible",
    keyPlaceholder: "sk-...",
    keyLabel: "Stability API Key",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Gemini native image generation — uses your Gemini API key",
    keyPlaceholder: "AIza...",
    keyLabel: "Google API Key (shared with LLM if same)",
  },
  {
    id: "replicate",
    name: "Replicate (Flux)",
    description: "Flux Schnell — open weights via Replicate",
    keyPlaceholder: "r8_...",
    keyLabel: "Replicate API Token",
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({});
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load settings and connections on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.ok ? r.json() : {}),
      fetch("/api/settings/connections").then((r) => r.ok ? r.json() : []),
    ]).then(([s, c]) => {
      setSettings(s);
      setConnections(Array.isArray(c) ? c : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const updateSetting = useCallback((key: keyof UserSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // Error saving
    } finally {
      setSaving(false);
    }
  }, [settings]);

  const handleDisconnect = useCallback(async (connectionId: string) => {
    const res = await fetch(`/api/settings/connections/${connectionId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setConnections((prev) => prev.filter((c) => c.id !== connectionId));
    }
  }, []);

  const selectedProvider = settings.llmProvider || "openai";
  const selectedImageProvider = settings.imageProvider || "openai";

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 text-accent animate-spin" />
        </div>
      </AppShell>
    );
  }

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
              {socialPlatforms.map((platform) => {
                const connection = connections.find(
                  (c) => c.platform === platform.id
                );
                return (
                  <Card
                    key={platform.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <platform.icon className="w-5 h-5 text-muted" />
                      <div>
                        <h3 className="text-sm font-medium">{platform.name}</h3>
                        <p className="text-xs text-muted">
                          {connection
                            ? `Connected as ${connection.accountName}`
                            : platform.description}
                        </p>
                      </div>
                    </div>
                    {connection ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDisconnect(connection.id)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" disabled>
                        Coming Soon
                      </Button>
                    )}
                  </Card>
                );
              })}
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
                    onClick={() => updateSetting("llmProvider", provider.id)}
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
                    label={
                      llmProviders.find((p) => p.id === selectedProvider)
                        ?.keyLabel || "API Key"
                    }
                    type="password"
                    placeholder={
                      llmProviders.find((p) => p.id === selectedProvider)
                        ?.keyPlaceholder || "sk-..."
                    }
                    value={settings.llmApiKey || ""}
                    onChange={(e) => updateSetting("llmApiKey", e.target.value)}
                  />
                  <p className="text-[10px] text-muted mt-2">
                    Keys saved here override environment variables. Leave blank to use
                    your <code className="font-mono">.env</code> config.
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
                    value={settings.ollamaUrl || ""}
                    onChange={(e) => updateSetting("ollamaUrl", e.target.value)}
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
                    onClick={() =>
                      updateSetting("imageProvider", provider.id)
                    }
                    className={`p-4 rounded-lg border transition-all text-left cursor-pointer ${
                      selectedImageProvider === provider.id
                        ? "border-accent bg-accent-muted"
                        : "border-border bg-surface hover:bg-card-hover"
                    }`}
                  >
                    <p className="text-sm font-medium">{provider.name}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {provider.description}
                    </p>
                  </button>
                ))}
              </div>

              {imageProviders
                .filter((p) => p.id === selectedImageProvider)
                .map((p) => (
                  <div key={p.id} className="pt-2">
                    <Input
                      id={`image-key-${p.id}`}
                      label={p.keyLabel}
                      type="password"
                      placeholder={p.keyPlaceholder}
                      value={settings.imageApiKey || ""}
                      onChange={(e) =>
                        updateSetting("imageApiKey", e.target.value)
                      }
                    />
                    <p className="text-[10px] text-muted mt-2">
                      Leave blank to use environment variable fallback.
                    </p>
                  </div>
                ))}
            </Card>
          </section>

          {/* Save button */}
          <div className="flex justify-end pb-8">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : saved ? (
                <Check className="w-3.5 h-3.5" />
              ) : null}
              {saved ? "Saved" : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
