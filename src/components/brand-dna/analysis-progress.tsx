"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, AlertCircle } from "lucide-react";
import type { CrawlProgress } from "@/lib/brand-dna/types";

interface AnalysisProgressProps {
  steps: CrawlProgress[];
}

export function AnalysisProgress({ steps }: AnalysisProgressProps) {
  return (
    <div className="space-y-4">
      <AnimatePresence>
        {steps.map((step, i) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              {step.status === "running" && (
                <Loader2 className="w-4 h-4 text-accent animate-spin" />
              )}
              {step.status === "done" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-4 h-4 rounded-full bg-success/15 flex items-center justify-center"
                >
                  <Check className="w-2.5 h-2.5 text-success" />
                </motion.div>
              )}
              {step.status === "error" && (
                <div className="w-4 h-4 rounded-full bg-danger/15 flex items-center justify-center">
                  <AlertCircle className="w-2.5 h-2.5 text-danger" />
                </div>
              )}
              {step.status === "pending" && (
                <div className="w-1.5 h-1.5 rounded-full bg-muted/20" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm ${
                  step.status === "running"
                    ? "text-foreground"
                    : step.status === "done"
                      ? "text-muted/60"
                      : "text-muted/30"
                }`}
              >
                {step.step}
              </p>
              {step.detail && (
                <p className="text-[11px] text-muted/40 truncate">{step.detail}</p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
