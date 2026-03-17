"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Sparkles,
  Wand2,
  Download,
  Loader2,
  Upload,
  X,
  ImageIcon,
} from "lucide-react";

const templates = [
  {
    id: "product-flat",
    name: "Flat Lay",
    description: "Clean top-down product shot on neutral background",
    promptSuffix: "flat lay photography, top-down view, neutral white background, studio lighting, clean minimal composition",
  },
  {
    id: "product-lifestyle",
    name: "Lifestyle",
    description: "Product in a real-world setting with natural lighting",
    promptSuffix: "lifestyle photography, natural lighting, real-world setting, warm atmosphere, authentic environment",
  },
  {
    id: "product-editorial",
    name: "Editorial",
    description: "Magazine-style dramatic lighting and composition",
    promptSuffix: "editorial photography, dramatic lighting, high contrast, magazine quality, bold composition",
  },
  {
    id: "product-minimal",
    name: "Minimal",
    description: "Clean, simple composition with solid background",
    promptSuffix: "minimalist product photography, solid color background, clean composition, elegant simplicity",
  },
  {
    id: "product-model",
    name: "On Model",
    description: "Product worn or held by a model in studio setting",
    promptSuffix: "fashion photography, model wearing/holding the product, studio setting, professional lighting, clean background",
  },
  {
    id: "product-contextual",
    name: "In Context",
    description: "Product placed in its natural usage environment",
    promptSuffix: "contextual product photography, product in use, natural environment, storytelling composition, warm tones",
  },
];

const aspectRatios = [
  { label: "1:1", size: "1024x1024" as const },
  { label: "4:5", size: "1024x1792" as const },
  { label: "9:16", size: "1024x1792" as const },
  { label: "16:9", size: "1792x1024" as const },
];

const styles = ["Photorealistic", "Illustration", "3D Render"];

async function generateImage(prompt: string, size: "1024x1024" | "1024x1792" | "1792x1024") {
  const res = await fetch("/api/images/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, size }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Generation failed");
  }
  const data = await res.json();
  return data.url as string;
}

async function describeImage(imageUrl: string): Promise<string> {
  const res = await fetch("/api/images/describe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to analyze image");
  }
  const data = await res.json();
  return data.description as string;
}

export default function PhotoshootPage() {
  // Product photoshoot state
  const [productDescription, setProductDescription] = useState("");
  const [productImage, setProductImage] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [productResult, setProductResult] = useState<string | null>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState("");
  const [productStatus, setProductStatus] = useState("");

  // Free-form generation state
  const [prompt, setPrompt] = useState("");
  const [selectedRatio, setSelectedRatio] = useState<"1024x1024" | "1024x1792" | "1792x1024">("1024x1024");
  const [selectedStyle, setSelectedStyle] = useState("Photorealistic");
  const [freeResult, setFreeResult] = useState<string | null>(null);
  const [freeLoading, setFreeLoading] = useState(false);
  const [freeError, setFreeError] = useState("");

  const handleProductImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setProductImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleProductGenerate = async () => {
    if (!selectedTemplate) return;
    if (!productDescription && !productImage) return;

    const template = templates.find((t) => t.id === selectedTemplate);
    if (!template) return;

    setProductLoading(true);
    setProductError("");
    setProductResult(null);
    setProductStatus("");

    try {
      let description = productDescription;

      // If product image uploaded, analyze it with vision AI
      if (productImage) {
        setProductStatus("Analyzing your product...");
        const aiDescription = await describeImage(productImage);
        // Combine user description with AI analysis
        description = productDescription
          ? `${productDescription}. AI analysis: ${aiDescription}`
          : aiDescription;
      }

      setProductStatus("Generating photoshoot...");
      const fullPrompt = `Professional product photography of ${description}. ${template.promptSuffix}. High quality, commercial photography, no text or watermarks.`;
      const url = await generateImage(fullPrompt, "1024x1024");
      setProductResult(url);
    } catch (e) {
      setProductError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setProductLoading(false);
      setProductStatus("");
    }
  };

  const handleFreeGenerate = async () => {
    if (!prompt) return;
    setFreeLoading(true);
    setFreeError("");
    setFreeResult(null);

    try {
      const stylePrefix = selectedStyle === "Photorealistic"
        ? "photorealistic, "
        : selectedStyle === "Illustration"
          ? "digital illustration, flat design, "
          : "3D render, CGI, ";
      const fullPrompt = `${stylePrefix}${prompt}. High quality, no text.`;
      const url = await generateImage(fullPrompt, selectedRatio);
      setFreeResult(url);
    } catch (e) {
      setFreeError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setFreeLoading(false);
    }
  };

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
            Upload your product or describe it to generate professional shots with AI.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Photoshoot */}
          <div>
            <h2 className="text-sm font-medium mb-2">Product Photoshoot</h2>
            <p className="text-xs text-muted mb-4">
              Upload a product image or describe it, then choose a style
            </p>

            <Card className="p-0 overflow-hidden">
              {/* Preview area */}
              <div className="aspect-[4/3] bg-gradient-to-br from-card-hover to-card flex flex-col items-center justify-center gap-3 border-b border-border relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {productLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <Loader2 className="w-8 h-8 text-accent animate-spin" />
                      <p className="text-xs text-muted">{productStatus || "Generating..."}</p>
                    </motion.div>
                  ) : productResult ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={productResult} alt="Generated" className="w-full h-full object-cover" />
                      <a
                        href={productResult}
                        download="photoshoot.png"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-3 right-3 p-2 rounded-lg bg-background/70 backdrop-blur hover:bg-background/90 transition-colors"
                      >
                        <Download className="w-4 h-4 text-foreground" />
                      </a>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <Camera className="w-8 h-8 text-muted/30" />
                      <p className="text-xs text-muted">Your product shot will appear here</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Controls */}
              <div className="p-4 space-y-3">
                {/* Product image upload */}
                <div>
                  <p className="text-xs text-muted mb-2">
                    Product image <span className="text-muted/50">(upload your product for AI mockups)</span>
                  </p>
                  {productImage ? (
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={productImage}
                          alt="Product"
                          className="h-20 w-20 rounded-lg border border-border object-cover"
                        />
                        <button
                          onClick={() => setProductImage(null)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center hover:bg-card-hover cursor-pointer"
                        >
                          <X className="w-3 h-3 text-muted" />
                        </button>
                      </div>
                      <p className="text-[10px] text-muted/60 pt-1">
                        AI will analyze your product and generate professional shots in the selected style
                      </p>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 px-4 py-6 rounded-lg border border-dashed border-border hover:border-accent/30 text-xs text-muted hover:text-foreground transition-colors cursor-pointer bg-surface/50">
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-5 h-5" />
                        <span>Upload product photo</span>
                        <span className="text-[10px] text-muted/50">PNG, JPG up to 10MB</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleProductImageUpload(file);
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* Divider with "or" */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] text-muted/50 uppercase tracking-wider">
                    {productImage ? "add details" : "or describe it"}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder={
                    productImage
                      ? "Add any extra details (optional — AI already sees your product)"
                      : "Describe your product (e.g. white ceramic coffee mug with minimal design)"
                  }
                  className="w-full bg-surface border border-border rounded-lg p-3 text-sm text-foreground placeholder:text-muted/30 resize-none focus:outline-none focus:border-accent/30"
                  rows={2}
                />

                <div>
                  <p className="text-xs text-muted mb-2">Select a style</p>
                  <div className="grid grid-cols-3 gap-2">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                          selectedTemplate === template.id
                            ? "border-accent bg-accent-muted"
                            : "border-border hover:border-accent/20 hover:bg-card-hover"
                        }`}
                      >
                        <p className="text-xs font-medium">{template.name}</p>
                        <p className="text-[10px] text-muted mt-0.5 line-clamp-1">{template.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {productError && (
                  <p className="text-xs text-danger">{productError}</p>
                )}

                <Button
                  className="w-full"
                  disabled={!selectedTemplate || (!productDescription && !productImage) || productLoading}
                  onClick={handleProductGenerate}
                >
                  {productLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {productLoading ? (productStatus || "Generating...") : productImage ? "Generate from Product" : "Generate Photoshoot"}
                </Button>
              </div>
            </Card>
          </div>

          {/* Free-form AI Image Generation */}
          <div>
            <h2 className="text-sm font-medium mb-2">Generate or edit an image</h2>
            <p className="text-xs text-muted mb-4">
              Describe the image you want to create
            </p>

            <Card className="p-0 overflow-hidden">
              {/* Preview area */}
              <div className="aspect-[4/3] bg-gradient-to-br from-card-hover to-card flex flex-col items-center justify-center gap-3 border-b border-border relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {freeLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <Loader2 className="w-8 h-8 text-accent animate-spin" />
                      <p className="text-xs text-muted">Generating...</p>
                    </motion.div>
                  ) : freeResult ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={freeResult} alt="Generated" className="w-full h-full object-cover" />
                      <a
                        href={freeResult}
                        download="generated.png"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-3 right-3 p-2 rounded-lg bg-background/70 backdrop-blur hover:bg-background/90 transition-colors"
                      >
                        <Download className="w-4 h-4 text-foreground" />
                      </a>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <Wand2 className="w-8 h-8 text-muted/30" />
                      <p className="text-xs text-muted">Your generated image will appear here</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Prompt input overlay */}
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <div className="flex gap-2 bg-card/90 backdrop-blur border border-border rounded-lg p-2">
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleFreeGenerate(); }}
                      placeholder="e.g. editorial shot with cinematic lighting..."
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted/30 focus:outline-none px-2"
                    />
                    <Button size="sm" disabled={!prompt || freeLoading} onClick={handleFreeGenerate}>
                      {freeLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted">Aspect ratio:</span>
                  <div className="flex gap-1">
                    {aspectRatios.map((ratio) => (
                      <button
                        key={ratio.label}
                        onClick={() => setSelectedRatio(ratio.size)}
                        className={`px-2 py-0.5 rounded text-[10px] border transition-colors cursor-pointer ${
                          selectedRatio === ratio.size
                            ? "border-accent bg-accent-muted text-accent"
                            : "border-border hover:border-accent/30 text-muted hover:text-foreground"
                        }`}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted">Style:</span>
                  <div className="flex gap-1">
                    {styles.map((style) => (
                      <button
                        key={style}
                        onClick={() => setSelectedStyle(style)}
                        className={`px-2 py-0.5 rounded text-[10px] border transition-colors cursor-pointer ${
                          selectedStyle === style
                            ? "border-accent bg-accent-muted text-accent"
                            : "border-border hover:border-accent/30 text-muted hover:text-foreground"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {freeError && (
                  <p className="text-xs text-danger">{freeError}</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
