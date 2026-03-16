"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { BrandCard } from "@/components/brand-dna/dna-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Palette, Megaphone, ArrowRight } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  url: string;
  colors: string[];
  tone: string;
  industry: string;
  audience: string;
  logoUrl: string | null;
  _count: { campaigns: number };
}

interface Campaign {
  id: string;
  goal: string;
  createdAt: string;
  brand: { name: string; colors: string[] };
  _count: { assets: number };
}

export default function DashboardPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/brands").then((r) => r.json()),
      fetch("/api/campaigns").then((r) => r.json()),
    ])
      .then(([brandsData, campaignsData]) => {
        setBrands(Array.isArray(brandsData) ? brandsData : []);
        setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
              Dashboard
            </h1>
            <p className="text-muted text-sm mt-1">
              Manage your brands and campaigns
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/brands/new">
              <Button variant="secondary">
                <Palette className="w-4 h-4" />
                New Brand
              </Button>
            </Link>
            <Link href="/campaigns/new">
              <Button>
                <Plus className="w-4 h-4" />
                New Campaign
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 rounded-2xl border border-border bg-card animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            {/* Brands */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  Your Brands
                </h2>
                {brands.length > 0 && (
                  <span className="text-xs text-muted">
                    {brands.length} brand{brands.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {brands.length === 0 ? (
                <Card className="text-center py-12">
                  <Palette className="w-8 h-8 text-muted mx-auto mb-3" />
                  <p className="text-muted mb-4">No brands yet</p>
                  <Link href="/brands/new">
                    <Button>
                      <Plus className="w-4 h-4" />
                      Analyze Your First Brand
                    </Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {brands.map((brand, i) => (
                    <motion.div
                      key={brand.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <BrandCard brand={brand} />
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* Recent Campaigns */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-primary" />
                  Recent Campaigns
                </h2>
              </div>

              {campaigns.length === 0 ? (
                <Card className="text-center py-12">
                  <Megaphone className="w-8 h-8 text-muted mx-auto mb-3" />
                  <p className="text-muted mb-4">No campaigns yet</p>
                  {brands.length > 0 && (
                    <Link href="/campaigns/new">
                      <Button>
                        <Plus className="w-4 h-4" />
                        Create Your First Campaign
                      </Button>
                    </Link>
                  )}
                </Card>
              ) : (
                <div className="space-y-3">
                  {campaigns.slice(0, 5).map((campaign) => (
                    <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                      <Card className="hover:border-primary/30 hover:bg-card-hover cursor-pointer flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex -space-x-1">
                            {campaign.brand.colors.slice(0, 3).map((color) => (
                              <div
                                key={color}
                                className="w-5 h-5 rounded-full border-2 border-card"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {campaign.goal}
                            </p>
                            <p className="text-xs text-muted">
                              {campaign.brand.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge>
                            {campaign._count.assets} asset
                            {campaign._count.assets !== 1 ? "s" : ""}
                          </Badge>
                          <ArrowRight className="w-4 h-4 text-muted" />
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
