"use client";

import Link from "next/link";
import { ColorPalette } from "@/components/ui/color-swatch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExternalLink, Megaphone } from "lucide-react";

interface BrandCardProps {
  brand: {
    id: string;
    name: string;
    url: string;
    colors: string[];
    tone: string;
    industry: string;
    audience: string;
    logoUrl: string | null;
    _count?: { campaigns: number };
  };
}

export function BrandCard({ brand }: BrandCardProps) {
  return (
    <Link href={`/brands/${brand.id}`}>
      <Card className="hover:border-primary/30 hover:bg-card-hover group cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {brand.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="w-10 h-10 rounded-lg object-cover bg-white"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                {brand.name.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {brand.name}
              </h3>
              <p className="text-xs text-muted flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                {new URL(brand.url).hostname}
              </p>
            </div>
          </div>
        </div>

        <ColorPalette colors={brand.colors.slice(0, 5)} size="sm" />

        <div className="flex flex-wrap gap-1.5 mt-4">
          <Badge variant="primary">{brand.tone}</Badge>
          <Badge>{brand.industry}</Badge>
        </div>

        {brand._count && (
          <div className="flex items-center gap-1.5 mt-4 text-xs text-muted">
            <Megaphone className="w-3.5 h-3.5" />
            {brand._count.campaigns} campaign
            {brand._count.campaigns !== 1 ? "s" : ""}
          </div>
        )}
      </Card>
    </Link>
  );
}
