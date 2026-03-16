"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { AssetCard } from "@/components/campaigns/asset-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ColorPalette } from "@/components/ui/color-swatch";
import { Megaphone, Instagram, Linkedin, Facebook, Twitter } from "lucide-react";

interface Asset {
  id: string;
  platform: string;
  caption: string;
  hashtags: string[];
  imageUrl: string | null;
  imagePrompt: string | null;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
}

interface CampaignData {
  id: string;
  goal: string;
  concepts: Array<{
    name: string;
    description: string;
    theme: string;
  }>;
  brand: {
    id: string;
    name: string;
    colors: string[];
    tone: string;
  };
  assets: Asset[];
  createdAt: string;
}

const platformTabs = [
  { id: "all", label: "All", icon: Megaphone },
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "facebook", label: "Facebook", icon: Facebook },
  { id: "twitter", label: "X / Twitter", icon: Twitter },
];

export default function CampaignPage() {
  const params = useParams();
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetch(`/api/campaigns/${params.id}`)
      .then((r) => r.json())
      .then(setCampaign)
      .finally(() => setLoading(false));
  }, [params.id]);

  const handlePublish = async (assetId: string) => {
    if (!campaign) return;
    await fetch(`/api/campaigns/${campaign.id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assetIds: [assetId] }),
    });
    // Refresh
    const updated = await fetch(`/api/campaigns/${params.id}`).then((r) =>
      r.json()
    );
    setCampaign(updated);
  };

  const handleSchedule = async (assetId: string, scheduledAt: string) => {
    if (!campaign) return;
    await fetch(`/api/campaigns/${campaign.id}/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assetIds: [assetId], scheduledAt }),
    });
    const updated = await fetch(`/api/campaigns/${params.id}`).then((r) =>
      r.json()
    );
    setCampaign(updated);
  };

  const handleUpdateCaption = async (assetId: string, caption: string) => {
    await fetch(`/api/campaigns/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assetId, caption }),
    });
  };

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto">
          <div className="h-48 rounded-2xl border border-border bg-card animate-pulse" />
        </div>
      </AppShell>
    );
  }

  if (!campaign) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto text-center py-20">
          <p className="text-muted">Campaign not found</p>
        </div>
      </AppShell>
    );
  }

  const filteredAssets =
    activeTab === "all"
      ? campaign.assets
      : campaign.assets.filter((a) => a.platform === activeTab);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
                {campaign.goal}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-muted">{campaign.brand.name}</span>
                <ColorPalette colors={campaign.brand.colors.slice(0, 4)} size="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Concepts */}
        {Array.isArray(campaign.concepts) && campaign.concepts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaign.concepts.slice(0, 3).map((concept, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full">
                  <Badge variant="primary" className="mb-2">
                    {concept.theme}
                  </Badge>
                  <h3 className="font-semibold text-sm mb-1">{concept.name}</h3>
                  <p className="text-xs text-muted">{concept.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Platform tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-card border border-border">
          {platformTabs.map((tab) => {
            const count =
              tab.id === "all"
                ? campaign.assets.length
                : campaign.assets.filter((a) => a.platform === tab.id).length;
            if (tab.id !== "all" && count === 0) return null;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <span className="text-xs opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Assets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onPublish={handlePublish}
              onSchedule={handleSchedule}
              onUpdateCaption={handleUpdateCaption}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
