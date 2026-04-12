"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileSearch, Clock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { listAtsScans } from "@/lib/api";
import { useSessionToken } from "@/hooks/use-session-token";
import type { AtsScan } from "@/types";
import { cn } from "@/lib/utils";

function scoreColor(score: number): string {
  if (score >= 80) return "bg-success/20 text-success";
  if (score >= 60) return "bg-warning/20 text-warning";
  return "bg-danger/20 text-danger";
}

export default function ScanHistoryPage() {
  const { token } = useSessionToken();
  const [scans, setScans] = useState<AtsScan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    listAtsScans(token)
      .then(setScans)
      .catch(() => toast.error("Failed to load scan history"))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <Link
          href="/resume-scan"
          className="mb-2 inline-flex items-center gap-1 text-sm text-secondary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to scanner
        </Link>
        <h1 className="text-3xl font-bold text-primary">Scan History</h1>
        <p className="mt-1 text-secondary">View all your past ATS scans</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-elevated"
            />
          ))}
        </div>
      ) : scans.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
          <FileSearch className="mb-4 h-12 w-12 text-secondary" />
          <h2 className="text-lg font-semibold text-primary">No scans yet</h2>
          <p className="mt-1 text-sm text-secondary">
            Scan your first resume to see results here
          </p>
          <Link
            href="/resume-scan"
            className="mt-4 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Scan Resume
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {scans.map((scan) => (
            <Link
              key={scan.id}
              href={`/resume-scan/${scan.id}`}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand-primary/30 hover:bg-elevated"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-brand-primary/10 p-2.5">
                  <FileSearch className="h-5 w-5 text-brand-primary" />
                </div>
                <div>
                  <p className="font-medium text-primary">
                    {scan.jobTitle || "General Scan"}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-secondary">
                    <Clock className="h-3 w-3" />
                    {new Date(scan.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {scan.resumeId && (
                      <>
                        <span>&middot;</span>
                        <span>Resume attached</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <span
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-bold",
                  scoreColor(scan.overallScore)
                )}
              >
                {scan.overallScore}%
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
