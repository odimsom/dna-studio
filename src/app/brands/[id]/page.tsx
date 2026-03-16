"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { DNAPreview } from "@/components/brand-dna/dna-preview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BrandDNA } from "@/lib/brand-dna/types";
import { Plus, ArrowRight, Megaphone } from "lucide-react";

interface BrandData {
  id: string;
  name: string;
  url: string;
  dna: BrandDNA;
  campaigns: Array<{
    id: string;
    goal: string;
    createdAt: string;
  }>;
}

export default function BrandPage() {
  const params = useParams();
  const [brand, setBrand] = useState<BrandData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/brands/${params.id}`)
      .then((r) => r.json())
      .then(setBrand)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto">
          <div className="h-64 rounded-2xl border border-border bg-card animate-pulse" />
        </div>
      </AppShell>
    );
  }

  if (!brand) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto text-center py-20">
          <p className="text-muted">Brand not found</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
            {brand.name}
          </h1>
          <Link href={`/campaigns/new?brandId=${brand.id}`}>
            <Button>
              <Plus className="w-4 h-4" />
              New Campaign
            </Button>
          </Link>
        </div>

        <DNAPreview dna={brand.dna} />

        {/* Campaigns */}
        <section>
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Megaphone className="w-4 h-4 text-primary" />
            Campaigns
          </h2>

          {brand.campaigns.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-muted mb-3">No campaigns yet for this brand</p>
              <Link href={`/campaigns/new?brandId=${brand.id}`}>
                <Button size="sm">
                  <Plus className="w-3 h-3" />
                  Create Campaign
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {brand.campaigns.map((campaign) => (
                <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                  <Card className="hover:border-primary/30 hover:bg-card-hover cursor-pointer flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{campaign.goal}</p>
                      <p className="text-xs text-muted">
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="primary">View</Badge>
                      <ArrowRight className="w-4 h-4 text-muted" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
