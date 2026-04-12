"use client";

import { useState } from "react";
import { Copy, Check, Loader2, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { generateColdEmail } from "@/lib/api";
import { useSessionToken } from "@/hooks/use-session-token";
import type { ColdEmail } from "@/types";

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(label ? `${label} copied!` : "Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-secondary transition-colors hover:bg-elevated hover:text-primary"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function ColdEmailPage() {
  const { token } = useSessionToken();
  const [jobPosting, setJobPosting] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<ColdEmail | null>(null);

  const handleGenerate = async () => {
    if (!token) return;
    if (!jobPosting.trim()) {
      toast.error("Please paste a job posting");
      return;
    }

    setGenerating(true);
    setResult(null);
    try {
      const email = await generateColdEmail({ jobPosting }, token);
      setResult(email);
      toast.success("Email generated!");
    } catch {
      toast.error("Failed to generate email");
    } finally {
      setGenerating(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setJobPosting("");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Cold Email Generator</h1>
        <p className="mt-1 text-secondary">
          Paste a job posting and get a personalized cold email instantly
        </p>
      </div>

      {!result ? (
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-primary">
              Job Posting
            </label>
            <textarea
              value={jobPosting}
              onChange={(e) => setJobPosting(e.target.value)}
              placeholder="Paste the full job posting here..."
              rows={12}
              className="w-full rounded-lg border border-border bg-elevated px-4 py-3 text-primary placeholder:text-secondary/50 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating || !jobPosting.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-3.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Mail className="h-5 w-5" />
                Generate Cold Email
              </span>
            )}
          </button>

          {generating && (
            <div className="space-y-4">
              <div className="h-10 animate-pulse rounded-lg bg-elevated" />
              <div className="h-48 animate-pulse rounded-lg bg-elevated" />
              <div className="h-32 animate-pulse rounded-lg bg-elevated" />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Subject Line */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-medium text-secondary">Subject Line</h2>
              <CopyButton text={result.subject} label="Subject" />
            </div>
            <p className="text-lg font-semibold text-primary">{result.subject}</p>
          </div>

          {/* Email Body */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-secondary">Email Body</h2>
              <CopyButton text={result.body} label="Email body" />
            </div>
            <div className="whitespace-pre-wrap rounded-lg bg-elevated p-4 text-sm leading-relaxed text-primary">
              {result.body}
            </div>
          </div>

          {/* Follow-up 1 */}
          {result.followUp1 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-medium text-secondary">Follow-up 1</h2>
                <CopyButton text={result.followUp1} label="Follow-up 1" />
              </div>
              <div className="whitespace-pre-wrap rounded-lg bg-elevated p-4 text-sm leading-relaxed text-primary">
                {result.followUp1}
              </div>
            </div>
          )}

          {/* Follow-up 2 */}
          {result.followUp2 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-medium text-secondary">Follow-up 2</h2>
                <CopyButton text={result.followUp2} label="Follow-up 2" />
              </div>
              <div className="whitespace-pre-wrap rounded-lg bg-elevated p-4 text-sm leading-relaxed text-primary">
                {result.followUp2}
              </div>
            </div>
          )}

          {/* Generate Another */}
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-elevated"
          >
            <RefreshCw className="h-4 w-4" />
            Generate Another
          </button>
        </div>
      )}
    </div>
  );
}
