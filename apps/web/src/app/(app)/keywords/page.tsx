"use client";

import { useState } from "react";
import {
  Search,
  Loader2,
  Copy,
  Check,
  FileCheck,
  Tag,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { optimizeKeywords, checkKeywords } from "@/lib/api";
import { useSessionToken } from "@/hooks/use-session-token";
import type { KeywordResult, KeywordItem } from "@/types";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All",
  "Technical Skills",
  "Soft Skills",
  "Tools",
  "Certifications",
  "Action Verbs",
  "Industry Terms",
] as const;

type Category = (typeof CATEGORIES)[number];

function ImportanceDots({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 w-2 rounded-full",
            i < score ? "bg-brand-primary" : "bg-border"
          )}
        />
      ))}
    </div>
  );
}

function categoryColor(category: string): string {
  const colors: Record<string, string> = {
    "Technical Skills": "bg-brand-primary/10 text-brand-primary",
    "Soft Skills": "bg-brand-secondary/10 text-brand-secondary",
    Tools: "bg-brand-accent/10 text-brand-accent",
    Certifications: "bg-warning/10 text-warning",
    "Action Verbs": "bg-success/10 text-success",
    "Industry Terms": "bg-danger/10 text-danger",
  };
  return colors[category] || "bg-border text-secondary";
}

export default function KeywordsPage() {
  const { token } = useSessionToken();
  const [targetRole, setTargetRole] = useState("");
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<KeywordResult | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [checking, setChecking] = useState(false);
  const [matchedKeywords, setMatchedKeywords] = useState<string[] | null>(null);
  const [missingKeywords, setMissingKeywords] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);

  const handleOptimize = async () => {
    if (!token) return;
    if (!targetRole.trim()) {
      toast.error("Please enter a target role");
      return;
    }

    setOptimizing(true);
    setResult(null);
    setMatchedKeywords(null);
    setMissingKeywords(null);
    try {
      const data = await optimizeKeywords({ targetRole }, token);
      setResult(data);
      toast.success("Keywords optimized!");
    } catch {
      toast.error("Failed to optimize keywords");
    } finally {
      setOptimizing(false);
    }
  };

  const handleCheckResume = async () => {
    if (!token || !result) return;
    setChecking(true);
    try {
      const targetKeywords = result.keywords.map((kw) => kw.keyword);
      const data = await checkKeywords({ resumeText: "", targetKeywords }, token);
      setMatchedKeywords(data.matchedKeywords || []);
      setMissingKeywords(data.missingKeywords || []);
      toast.success("Resume checked against keywords!");
    } catch {
      toast.error("Failed to check resume. Make sure you have a default resume set.");
    } finally {
      setChecking(false);
    }
  };

  const handleCopyAll = async () => {
    if (!result?.keywords) return;
    const text = result.keywords.map((kw) => kw.keyword).join(", ");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("All keywords copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredKeywords =
    result?.keywords?.filter(
      (kw) => activeCategory === "All" || kw.category === activeCategory
    ) ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Keyword Optimizer</h1>
        <p className="mt-1 text-secondary">
          Find the most impactful keywords for your target role
        </p>
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="Enter target role (e.g. Senior Software Engineer)"
          onKeyDown={(e) => e.key === "Enter" && handleOptimize()}
          className="flex-1 rounded-lg border border-border bg-elevated px-4 py-3 text-primary placeholder:text-secondary/50 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
        />
        <button
          onClick={handleOptimize}
          disabled={optimizing || !targetRole.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {optimizing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="h-5 w-5" />
          )}
          Optimize
        </button>
      </div>

      {/* Loading shimmer */}
      {optimizing && (
        <div className="space-y-4">
          <div className="h-16 animate-pulse rounded-xl bg-elevated" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl bg-elevated"
              />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result && !optimizing && (
        <div className="space-y-6">
          {/* Summary */}
          {result.summary && (
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm leading-relaxed text-primary">
                {result.summary}
              </p>
            </div>
          )}

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  activeCategory === cat
                    ? "bg-brand-primary text-white"
                    : "bg-elevated text-secondary hover:text-primary"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Keywords List */}
          <div className="space-y-3">
            {filteredKeywords
              .sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))
              .map((kw, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary">
                          {kw.keyword}
                        </span>
                        {kw.category && (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-medium",
                              categoryColor(kw.category)
                            )}
                          >
                            {kw.category}
                          </span>
                        )}
                      </div>
                      {kw.tip && (
                        <p className="mt-1.5 text-sm text-secondary">
                          {kw.tip}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0">
                      <ImportanceDots score={kw.importance ?? 5} />
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {filteredKeywords.length === 0 && (
            <p className="py-8 text-center text-secondary">
              No keywords in this category
            </p>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopyAll}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-elevated"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied!" : "Copy All Keywords"}
            </button>
            <button
              onClick={handleCheckResume}
              disabled={checking}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-accent/10 px-4 py-2.5 text-sm font-medium text-brand-accent transition-colors hover:bg-brand-accent/20 disabled:opacity-50"
            >
              {checking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileCheck className="h-4 w-4" />
              )}
              Check My Resume
            </button>
          </div>

          {/* Resume check results */}
          {(matchedKeywords || missingKeywords) && (
            <div className="space-y-4 rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold text-primary">
                Resume Keyword Analysis
              </h3>
              {matchedKeywords && matchedKeywords.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-success">
                    Matched ({matchedKeywords.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {matchedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-success/10 px-3 py-1 text-sm text-success"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {missingKeywords && missingKeywords.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-warning">
                    Missing ({missingKeywords.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {missingKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-warning/10 px-3 py-1 text-sm text-warning"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
