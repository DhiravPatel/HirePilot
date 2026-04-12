"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ArrowLeft,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Tag,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { getAtsScan, deleteAtsScan } from "@/lib/api";
import { useSessionToken } from "@/hooks/use-session-token";
import type { AtsScan } from "@/types";
import { cn } from "@/lib/utils";

function ScoreGauge({ score }: { score: number }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="200" height="200" className="-rotate-90">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#2d2d3d"
          strokeWidth="12"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-5xl font-bold text-primary">{score}</span>
        <span className="text-sm text-secondary">out of 100</span>
      </div>
    </div>
  );
}

const TABS = [
  { id: "strengths", label: "Strengths", icon: CheckCircle2 },
  { id: "weaknesses", label: "Weaknesses", icon: XCircle },
  { id: "suggestions", label: "Suggestions", icon: Lightbulb },
  { id: "keywords", label: "Keywords", icon: Tag },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ScanResultPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useSessionToken();
  const router = useRouter();
  const [scan, setScan] = useState<AtsScan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("strengths");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    getAtsScan(id, token)
      .then(setScan)
      .catch(() => toast.error("Failed to load scan result"))
      .finally(() => setLoading(false));
  }, [token, id]);

  const handleDelete = async () => {
    if (!token || !id) return;
    if (!confirm("Are you sure you want to delete this scan?")) return;
    setDeleting(true);
    try {
      await deleteAtsScan(id, token);
      toast.success("Scan deleted");
      router.push("/resume-scan/history");
    } catch {
      toast.error("Failed to delete scan");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-elevated" />
        <div className="flex justify-center">
          <div className="h-[200px] w-[200px] animate-pulse rounded-full bg-elevated" />
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-elevated" />
        <div className="h-48 animate-pulse rounded-xl bg-elevated" />
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-secondary">Scan not found</p>
          <Link
            href="/resume-scan"
            className="mt-4 inline-block text-brand-primary hover:underline"
          >
            Go back to scanner
          </Link>
        </div>
      </div>
    );
  }

  const subScores = [
    { name: "Formatting", score: scan.formattingScore ?? 0, color: "#6366f1" },
    { name: "Keywords", score: scan.keywordsScore ?? 0, color: "#8b5cf6" },
    { name: "Experience", score: scan.experienceScore ?? 0, color: "#06b6d4" },
    { name: "Education", score: scan.educationScore ?? 0, color: "#10b981" },
    { name: "Skills", score: scan.skillsScore ?? 0, color: "#f59e0b" },
    { name: "Readability", score: scan.readabilityScore ?? 0, color: "#ec4899" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/resume-scan/history"
            className="mb-2 inline-flex items-center gap-1 text-sm text-secondary hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Back to history
          </Link>
          <h1 className="text-3xl font-bold text-primary">Scan Results</h1>
          <p className="mt-1 text-secondary">
            {scan.jobTitle ? `Target: ${scan.jobTitle}` : "General ATS scan"}{" "}
            &middot;{" "}
            {new Date(scan.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/resume-scan"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-primary transition-colors hover:bg-elevated"
          >
            <RefreshCw className="h-4 w-4" /> Scan Again
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-lg border border-danger/30 px-4 py-2 text-sm text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </button>
        </div>
      </div>

      {/* Score Gauge */}
      <div className="flex justify-center rounded-xl border border-border bg-card p-8">
        <ScoreGauge score={scan.overallScore} />
      </div>

      {/* Sub-scores Chart */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-primary">
          Score Breakdown
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={subScores} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3d" />
            <XAxis
              type="number"
              domain={[0, 100]}
              stroke="#94a3b8"
              fontSize={12}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#94a3b8"
              fontSize={12}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a23",
                border: "1px solid #2d2d3d",
                borderRadius: "8px",
                color: "#f1f5f9",
              }}
            />
            <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={24}>
              {subScores.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabs */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex border-b border-border">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "border-b-2 border-brand-primary text-brand-primary"
                    : "text-secondary hover:text-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === "strengths" && (
            <div className="flex flex-wrap gap-2">
              {scan.strengths && scan.strengths.length > 0 ? (
                scan.strengths.map((s, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-success/10 px-3 py-1.5 text-sm text-success"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <p className="text-secondary">No strengths identified</p>
              )}
            </div>
          )}

          {activeTab === "weaknesses" && (
            <div className="flex flex-wrap gap-2">
              {scan.weaknesses && scan.weaknesses.length > 0 ? (
                scan.weaknesses.map((w, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-danger/10 px-3 py-1.5 text-sm text-danger"
                  >
                    {w}
                  </span>
                ))
              ) : (
                <p className="text-secondary">No weaknesses identified</p>
              )}
            </div>
          )}

          {activeTab === "suggestions" && (
            <div className="space-y-3">
              {scan.suggestions && scan.suggestions.length > 0 ? (
                scan.suggestions.map((s, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary/20 text-xs font-semibold text-brand-primary">
                      {i + 1}
                    </span>
                    <p className="text-sm text-primary">{s}</p>
                  </div>
                ))
              ) : (
                <p className="text-secondary">No suggestions</p>
              )}
            </div>
          )}

          {activeTab === "keywords" && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-sm font-medium text-success">
                  Matched Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {scan.matchedKeywords && scan.matchedKeywords.length > 0 ? (
                    scan.matchedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-success/10 px-3 py-1 text-sm text-success"
                      >
                        {kw}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-secondary">None</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-medium text-warning">
                  Missing Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {scan.missingKeywords && scan.missingKeywords.length > 0 ? (
                    scan.missingKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-warning/10 px-3 py-1 text-sm text-warning"
                      >
                        {kw}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-secondary">None</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
