"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
  Calendar,
  Send,
  Edit3,
  Check,
  X,
  Image as ImageIcon,
} from "lucide-react";

interface AssetCardProps {
  asset: {
    id: string;
    platform: string;
    caption: string;
    hashtags: string[];
    imageUrl: string | null;
    imagePrompt: string | null;
    status: string;
    scheduledAt: string | null;
    publishedAt: string | null;
  };
  onPublish?: (id: string) => void;
  onSchedule?: (id: string, date: string) => void;
  onUpdateCaption?: (id: string, caption: string) => void;
}

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  linkedin: Linkedin,
  facebook: Facebook,
  twitter: Twitter,
};

const platformColors: Record<string, string> = {
  instagram: "from-pink-500 to-purple-600",
  linkedin: "from-blue-600 to-blue-700",
  facebook: "from-blue-500 to-blue-600",
  twitter: "from-sky-400 to-sky-500",
};

const statusVariants: Record<string, "default" | "success" | "warning" | "danger" | "primary"> = {
  draft: "default",
  scheduled: "warning",
  published: "success",
  failed: "danger",
};

export function AssetCard({
  asset,
  onPublish,
  onSchedule,
  onUpdateCaption,
}: AssetCardProps) {
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(asset.caption);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  const Icon = platformIcons[asset.platform] || Send;

  const handleSaveCaption = () => {
    onUpdateCaption?.(asset.id, caption);
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        {/* Platform header */}
        <div
          className={`bg-gradient-to-r ${platformColors[asset.platform] || "from-gray-500 to-gray-600"} px-4 py-2 -mx-6 -mt-6 mb-4 flex items-center justify-between`}
        >
          <div className="flex items-center gap-2 text-white">
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium capitalize">
              {asset.platform}
            </span>
          </div>
          <Badge variant={statusVariants[asset.status]}>{asset.status}</Badge>
        </div>

        {/* Image placeholder */}
        {asset.imagePrompt && (
          <div className="bg-border/30 rounded-xl p-4 mb-4 flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-muted" />
            <p className="text-xs text-muted line-clamp-2">
              {asset.imagePrompt}
            </p>
          </div>
        )}

        {/* Caption */}
        <div className="mb-4">
          {editing ? (
            <div className="space-y-2">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                rows={4}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveCaption}>
                  <Check className="w-3 h-3" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setCaption(asset.caption);
                    setEditing(false);
                  }}
                >
                  <X className="w-3 h-3" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="group relative">
              <p className="text-sm text-foreground/85 whitespace-pre-line">
                {asset.caption}
              </p>
              <button
                onClick={() => setEditing(true)}
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-card-hover cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-muted" />
              </button>
            </div>
          )}
        </div>

        {/* Hashtags */}
        {asset.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {asset.hashtags.map((tag) => (
              <span key={tag} className="text-xs text-primary">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        {asset.status === "draft" && (
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button
              size="sm"
              onClick={() => onPublish?.(asset.id)}
            >
              <Send className="w-3 h-3" />
              Publish Now
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowScheduler(!showScheduler)}
            >
              <Calendar className="w-3 h-3" />
              Schedule
            </Button>
          </div>
        )}

        {showScheduler && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 flex gap-2"
          >
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground"
            />
            <Button
              size="sm"
              disabled={!scheduleDate}
              onClick={() => {
                onSchedule?.(asset.id, new Date(scheduleDate).toISOString());
                setShowScheduler(false);
              }}
            >
              Confirm
            </Button>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}
