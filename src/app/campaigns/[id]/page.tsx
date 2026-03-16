"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { AssetCard } from "@/components/campaigns/asset-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, Instagram, Linkedin, Facebook, Twitter, Plus, ArrowLeft } from "lucide-react";

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
  { id: "twitter", label: "X", icon: Twitter },
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
        <div className="max-w-5xl mx-auto">
          <div className="h-48 rounded-xl bg-card animate-pulse" />
        </div>
      </AppShell>
    );
  }

  if (!campaign) {
    return (
      <AppShell>
        <div className="max-w-5xl mx-auto text-center py-20">
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
      <div className="max-w-5xl mx-auto">
        {/* Back link */}
        <Link
          href="/campaigns/new"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Campaigns
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <Megaphone className="w-6 h-6 text-accent mx-auto mb-4" />
          <h1 className="text-3xl font-[family-name:var(--font-heading)] italic mb-2">
            Campaign
          </h1>
          <p className="text-sm text-muted max-w-lg mx-auto">
            Here is a series of creatives to post for this campaign.
            You can edit, delete or generate more.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          {/* Campaign info sidebar */}
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Megaphone className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs text-muted">Goal</span>
              </div>
              <p className="text-sm font-medium">{campaign.goal}</p>
              <p className="text-xs text-muted mt-2">
                {campaign.brand.name}
              </p>
            </Card>

            {Array.isArray(campaign.concepts) && campaign.concepts.length > 0 && (
              <Card className="p-4">
                <span className="text-xs text-muted">Concepts</span>
                <div className="space-y-3 mt-3">
                  {campaign.concepts.slice(0, 3).map((concept, i) => (
                    <div key={i}>
                      <p className="text-xs font-medium">{concept.name}</p>
                      <p className="text-[11px] text-muted mt-0.5">{concept.description}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Creatives grid */}
          <div>
            {/* Platform filter tabs */}
            <div className="flex gap-1 mb-6">
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-accent text-background font-medium"
                        : "text-muted hover:text-foreground hover:bg-card"
                    }`}
                  >
                    <tab.icon className="w-3 h-3" />
                    {tab.label}
                    <span className="opacity-50">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Asset cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onPublish={handlePublish}
                  onSchedule={handleSchedule}
                  onUpdateCaption={handleUpdateCaption}
                />
              ))}

              {/* Add creative button */}
              <button
                onClick={() => {/* TODO: add creative flow */}}
                className="aspect-[4/5] rounded-xl border border-dashed border-border hover:border-accent/30 flex flex-col items-center justify-center gap-2 text-muted hover:text-accent transition-colors cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                <span className="text-sm">Add Creative</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
