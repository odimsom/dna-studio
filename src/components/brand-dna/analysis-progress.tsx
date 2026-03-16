"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, AlertCircle } from "lucide-react";
import type { CrawlProgress } from "@/lib/brand-dna/types";

interface AnalysisProgressProps {
  steps: CrawlProgress[];
}

export function AnalysisProgress({ steps }: AnalysisProgressProps) {
  return (
    <div className="space-y-3">
      <AnimatePresence>
        {steps.map((step, i) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              {step.status === "running" && (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              )}
              {step.status === "done" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-success" />
                </motion.div>
              )}
              {step.status === "error" && (
                <div className="w-5 h-5 rounded-full bg-danger/20 flex items-center justify-center">
                  <AlertCircle className="w-3 h-3 text-danger" />
                </div>
              )}
              {step.status === "pending" && (
                <div className="w-2 h-2 rounded-full bg-muted/30" />
              )}
            </div>
            <div className="flex-1">
              <p
                className={`text-sm ${
                  step.status === "running"
                    ? "text-foreground font-medium"
                    : step.status === "done"
                      ? "text-muted"
                      : "text-muted/50"
                }`}
              >
                {step.step}
              </p>
              {step.detail && (
                <p className="text-xs text-muted/60">{step.detail}</p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
