"use client";

import { motion } from "framer-motion";
import { ColorSwatch } from "@/components/ui/color-swatch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { BrandDNA } from "@/lib/brand-dna/types";
import { Globe, Type, Users, Sparkles } from "lucide-react";

interface DNAPreviewProps {
  dna: BrandDNA;
}

export function DNAPreview({ dna }: DNAPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="border-primary/30">
        <div className="flex items-center gap-4 mb-4">
          {dna.logoUrl ? (
            <img
              src={dna.logoUrl}
              alt={dna.name}
              className="w-16 h-16 rounded-xl object-cover bg-white"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
              {dna.name.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
              {dna.name}
            </h2>
            <p className="text-muted text-sm flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              {dna.url}
            </p>
            {dna.tagline && (
              <p className="text-sm text-foreground/70 mt-1">{dna.tagline}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="primary">{dna.industry}</Badge>
          <Badge>{dna.category}</Badge>
          {dna.keywords.slice(0, 3).map((kw) => (
            <Badge key={kw}>{kw}</Badge>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Colors */}
        <Card>
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Brand Colors
          </h3>
          <div className="flex flex-wrap gap-3">
            {dna.colors.map((color) => (
              <div key={color.hex} className="text-center">
                <ColorSwatch
                  color={color.hex}
                  size="lg"
                />
                <p className="text-xs text-muted mt-1">{color.name}</p>
                <p className="text-[10px] text-muted/60">{color.hex}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Fonts */}
        <Card>
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <Type className="w-4 h-4 text-primary" />
            Typography
          </h3>
          <div className="space-y-3">
            {dna.fonts.map((font) => (
              <div
                key={font.family}
                className="flex items-center justify-between"
              >
                <span
                  className="text-lg text-foreground"
                  style={{ fontFamily: font.family }}
                >
                  {font.family}
                </span>
                <Badge>{font.usage}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Tone */}
        <Card>
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Tone of Voice
          </h3>
          <div className="flex gap-2 mb-4">
            <Badge variant="primary">{dna.tone.primary}</Badge>
            <Badge>{dna.tone.secondary}</Badge>
          </div>
          <p className="text-sm text-foreground/70 mb-4">
            {dna.tone.description}
          </p>
          <div className="space-y-3">
            <ToneMeter label="Formality" value={dna.tone.formality} />
            <ToneMeter label="Energy" value={dna.tone.energy} />
            <ToneMeter label="Warmth" value={dna.tone.warmth} />
          </div>
        </Card>

        {/* Audience */}
        <Card>
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Target Audience
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-muted">Primary</span>
              <p className="text-sm font-medium">{dna.audience.primary}</p>
            </div>
            <div>
              <span className="text-xs text-muted">Secondary</span>
              <p className="text-sm font-medium">{dna.audience.secondary}</p>
            </div>
            <div>
              <span className="text-xs text-muted">Age Range</span>
              <p className="text-sm font-medium">{dna.audience.ageRange}</p>
            </div>
            <div>
              <span className="text-xs text-muted">Interests</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {dna.audience.interests.map((interest) => (
                  <Badge key={interest}>{interest}</Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

function ToneMeter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted">{label}</span>
        <span className="text-foreground">{value}%</span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
