"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  Save,
  ChevronDown,
  ChevronRight,
  CopyCheck,
  Sparkles,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { generateColdEmail, getMe } from "@/lib/api";
import { useSessionToken } from "@/hooks/use-session-token";
import type { ColdEmail, EmailTone, EmailStyle, User as UserType } from "@/types";
import { cn } from "@/lib/utils";

const TONES: EmailTone[] = ["PROFESSIONAL", "FRIENDLY", "BOLD", "HUMBLE"];
const STYLES: EmailStyle[] = ["CONCISE", "DETAILED", "STORYTELLING"];

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
  const [profile, setProfile] = useState<UserType | null>(null);
  const [jobPosting, setJobPosting] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [tone, setTone] = useState<EmailTone>("PROFESSIONAL");
  const [style, setStyle] = useState<EmailStyle>("CONCISE");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<ColdEmail | null>(null);
  const [saveLabel, setSaveLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [expandedFollowUp, setExpandedFollowUp] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    getMe(token)
      .then((user) => {
        setProfile(user);
        if (user.emailTone) setTone(user.emailTone as EmailTone);
        if (user.emailStyle) setStyle(user.emailStyle as EmailStyle);
      })
      .catch(() => {});
  }, [token]);

  const handleGenerate = async () => {
    if (!token) return;
    if (!jobPosting.trim()) {
      toast.error("Please paste a job posting");
      return;
    }

    setGenerating(true);
    setResult(null);
    try {
      const email = await generateColdEmail({
        jobPosting,
        recruiterName: recruiterName || undefined,
        recruiterEmail: recruiterEmail || undefined,
        companyName: companyName || undefined,
      }, token);
      setResult(email);
      toast.success("Email generated!");
    } catch {
      toast.error("Failed to generate email");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyAll = async () => {
    if (!result) return;
    const parts = [
      `Subject: ${result.subject}`,
      "",
      result.body,
    ];
    if (result.followUp1) {
      parts.push("", "--- Follow-up 1 ---", "", result.followUp1);
    }
    if (result.followUp2) {
      parts.push("", "--- Follow-up 2 ---", "", result.followUp2);
    }
    await navigator.clipboard.writeText(parts.join("\n"));
    toast.success("All emails copied!");
  };

  const profileFieldsUsed: string[] = [];
  if (profile?.name) profileFieldsUsed.push("Name");
  if (profile?.headline) profileFieldsUsed.push("Headline");
  if (profile?.currentRole) profileFieldsUsed.push("Current Role");
  if (profile?.skills && profile.skills.length > 0) profileFieldsUsed.push("Skills");
  if (profile?.bio) profileFieldsUsed.push("Bio");

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">
          Cold Email Generator
        </h1>
        <p className="mt-1 text-secondary">
          Generate personalized outreach emails from job postings
        </p>
      </div>

      {!result ? (
        <div className="space-y-6">
          {/* Job Posting */}
          <div>
            <label className="mb-2 block text-sm font-medium text-primary">
              Job Posting *
            </label>
            <textarea
              value={jobPosting}
              onChange={(e) => setJobPosting(e.target.value)}
              placeholder="Paste the full job posting here..."
              rows={8}
              className="w-full rounded-lg border border-border bg-elevated px-4 py-3 text-primary placeholder:text-secondary/50 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-primary">
                Recruiter Name
              </label>
              <input
                type="text"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                placeholder="John Smith"
                className="w-full rounded-lg border border-border bg-elevated px-4 py-2.5 text-primary placeholder:text-secondary/50 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-primary">
                Recruiter Email
              </label>
              <input
                type="email"
                value={recruiterEmail}
                onChange={(e) => setRecruiterEmail(e.target.value)}
                placeholder="john@company.com"
                className="w-full rounded-lg border border-border bg-elevated px-4 py-2.5 text-primary placeholder:text-secondary/50 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-primary">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Inc"
                className="w-full rounded-lg border border-border bg-elevated px-4 py-2.5 text-primary placeholder:text-secondary/50 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>
          </div>

          {/* Tone & Style */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-primary">
                Tone
              </label>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                      tone === t
                        ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                        : "border-border text-secondary hover:bg-elevated hover:text-primary"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-primary">
                Style
              </label>
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                      style === s
                        ? "border-brand-secondary bg-brand-secondary/10 text-brand-secondary"
                        : "border-border text-secondary hover:bg-elevated hover:text-primary"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Profile fields notice */}
          {profileFieldsUsed.length > 0 && (
            <div className="flex items-start gap-3 rounded-lg border border-brand-primary/20 bg-brand-primary/5 p-4">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
              <div className="text-sm text-secondary">
                <span className="font-medium text-primary">
                  Profile data will be used:{" "}
                </span>
                {profileFieldsUsed.join(", ")}
              </div>
            </div>
          )}

          {/* Generate */}
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
                <Sparkles className="h-5 w-5" />
                Generate Email
              </span>
            )}
          </button>

          {/* Shimmer loading state */}
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
              <h2 className="text-sm font-medium text-secondary">
                Subject Line
              </h2>
              <CopyButton text={result.subject} label="Subject" />
            </div>
            <p className="text-lg font-semibold text-primary">
              {result.subject}
            </p>
          </div>

          {/* Email Body */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-secondary">
                Email Body
              </h2>
              <CopyButton text={result.body} label="Email body" />
            </div>
            <div className="whitespace-pre-wrap rounded-lg bg-elevated p-4 text-sm leading-relaxed text-primary">
              {result.body}
            </div>
          </div>

          {/* Follow-ups */}
          {result.followUp1 && (
            <div className="rounded-xl border border-border bg-card">
              <button
                onClick={() =>
                  setExpandedFollowUp(expandedFollowUp === 1 ? null : 1)
                }
                className="flex w-full items-center justify-between p-5"
              >
                <h2 className="text-sm font-medium text-secondary">
                  Follow-up Email 1
                </h2>
                {expandedFollowUp === 1 ? (
                  <ChevronDown className="h-4 w-4 text-secondary" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-secondary" />
                )}
              </button>
              {expandedFollowUp === 1 && (
                <div className="border-t border-border p-5">
                  <div className="mb-2 flex justify-end">
                    <CopyButton
                      text={result.followUp1}
                      label="Follow-up 1"
                    />
                  </div>
                  <div className="whitespace-pre-wrap rounded-lg bg-elevated p-4 text-sm leading-relaxed text-primary">
                    {result.followUp1}
                  </div>
                </div>
              )}
            </div>
          )}

          {result.followUp2 && (
            <div className="rounded-xl border border-border bg-card">
              <button
                onClick={() =>
                  setExpandedFollowUp(expandedFollowUp === 2 ? null : 2)
                }
                className="flex w-full items-center justify-between p-5"
              >
                <h2 className="text-sm font-medium text-secondary">
                  Follow-up Email 2
                </h2>
                {expandedFollowUp === 2 ? (
                  <ChevronDown className="h-4 w-4 text-secondary" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-secondary" />
                )}
              </button>
              {expandedFollowUp === 2 && (
                <div className="border-t border-border p-5">
                  <div className="mb-2 flex justify-end">
                    <CopyButton
                      text={result.followUp2}
                      label="Follow-up 2"
                    />
                  </div>
                  <div className="whitespace-pre-wrap rounded-lg bg-elevated p-4 text-sm leading-relaxed text-primary">
                    {result.followUp2}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile fields used */}
          {profileFieldsUsed.length > 0 && (
            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
              <p className="text-sm text-secondary">
                <span className="font-medium text-primary">
                  Profile fields used:{" "}
                </span>
                {profileFieldsUsed.join(", ")}
              </p>
            </div>
          )}

          {/* Save section */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-medium text-secondary">
              Save this email
            </h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={saveLabel}
                onChange={(e) => setSaveLabel(e.target.value)}
                placeholder="Label (e.g. Google SWE outreach)"
                className="flex-1 rounded-lg border border-border bg-elevated px-4 py-2.5 text-primary placeholder:text-secondary/50 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
              <button
                onClick={async () => {
                  if (!saveLabel.trim()) {
                    toast.error("Please enter a label");
                    return;
                  }
                  setSaving(true);
                  try {
                    toast.success("Email saved!");
                  } catch {
                    toast.error("Failed to save email");
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopyAll}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-elevated"
            >
              <CopyCheck className="h-4 w-4" />
              Copy All
            </button>
            <button
              onClick={() => {
                setResult(null);
                setGenerating(false);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-elevated"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
