"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Upload,
  Sparkles,
  Image as ImageIcon,
  Wand2,
  ArrowRight,
} from "lucide-react";

const templates = [
  {
    id: "product-flat",
    name: "Flat Lay",
    description: "Clean top-down product shot on neutral background",
    gradient: "from-amber-900/30 to-stone-900/30",
  },
  {
    id: "product-lifestyle",
    name: "Lifestyle",
    description: "Product in a real-world setting with natural lighting",
    gradient: "from-emerald-900/30 to-stone-900/30",
  },
  {
    id: "product-editorial",
    name: "Editorial",
    description: "Magazine-style dramatic lighting and composition",
    gradient: "from-violet-900/30 to-stone-900/30",
  },
  {
    id: "product-minimal",
    name: "Minimal",
    description: "Clean, simple composition with solid background",
    gradient: "from-sky-900/30 to-stone-900/30",
  },
];

export default function PhotoshootPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Camera className="w-6 h-6 text-accent mx-auto mb-4" />
          <h1 className="text-3xl font-[family-name:var(--font-heading)] italic mb-2">
            Photoshoot
          </h1>
          <p className="text-sm text-muted max-w-md mx-auto">
            Choose a guided template for professional product shots or use our
            flexible editor to create anything you can imagine.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Photoshoot */}
          <div>
            <h2 className="text-sm font-medium mb-2">Create a product photoshoot</h2>
            <p className="text-xs text-muted mb-4">
              Choose a product image and templates to get professional shots
            </p>

            <Card className="p-0 overflow-hidden">
              {/* Upload area */}
              <div className="aspect-[4/3] bg-gradient-to-br from-card-hover to-card flex flex-col items-center justify-center gap-3 border-b border-border">
                <div className="w-12 h-12 rounded-xl bg-accent-muted flex items-center justify-center">
                  <Upload className="w-5 h-5 text-accent" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Upload Product Image</p>
                  <p className="text-xs text-muted mt-0.5">PNG, JPG up to 10MB</p>
                </div>
                <Button size="sm" variant="secondary">
                  Choose File
                </Button>
              </div>

              {/* Templates */}
              <div className="p-4">
                <p className="text-xs text-muted mb-3">Select a style</p>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                        selectedTemplate === template.id
                          ? "border-accent bg-accent-muted"
                          : "border-border hover:border-accent/20 hover:bg-card-hover"
                      }`}
                    >
                      <p className="text-xs font-medium">{template.name}</p>
                      <p className="text-[10px] text-muted mt-0.5">{template.description}</p>
                    </button>
                  ))}
                </div>

                <Button
                  className="w-full mt-4"
                  disabled={!selectedTemplate}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Photoshoot
                </Button>
              </div>
            </Card>
          </div>

          {/* AI Image Generation */}
          <div>
            <h2 className="text-sm font-medium mb-2">Generate or edit an image</h2>
            <p className="text-xs text-muted mb-4">
              Describe the image you want with a prompt or edit an existing one
            </p>

            <Card className="p-0 overflow-hidden">
              {/* Preview area */}
              <div className="aspect-[4/3] bg-gradient-to-br from-card-hover to-card flex flex-col items-center justify-center gap-3 border-b border-border relative">
                <ImageIcon className="w-8 h-8 text-muted/30" />
                <p className="text-xs text-muted">Your generated image will appear here</p>

                {/* Prompt input overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex gap-2 bg-card/90 backdrop-blur border border-border rounded-lg p-2">
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="editorial shot with ci..."
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted/30 focus:outline-none px-2"
                    />
                    <Button size="sm" disabled={!prompt}>
                      <Wand2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">Aspect ratio:</span>
                  <div className="flex gap-1">
                    {["1:1", "4:5", "9:16", "16:9"].map((ratio) => (
                      <button
                        key={ratio}
                        className="px-2 py-0.5 rounded text-[10px] border border-border hover:border-accent/30 text-muted hover:text-foreground transition-colors cursor-pointer"
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">Style:</span>
                  <div className="flex gap-1">
                    {["Photorealistic", "Illustration", "3D Render"].map((style) => (
                      <button
                        key={style}
                        className="px-2 py-0.5 rounded text-[10px] border border-border hover:border-accent/30 text-muted hover:text-foreground transition-colors cursor-pointer"
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-muted/50 pt-2">
                  Image generation requires an API key for DALL-E, Stable Diffusion, or Flux.
                  Configure in Settings.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
