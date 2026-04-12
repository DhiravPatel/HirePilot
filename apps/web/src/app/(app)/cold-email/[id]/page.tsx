"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronRight,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { getColdEmail, deleteColdEmail } from "@/lib/api";
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

export default function ColdEmailDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useSessionToken();
  const router = useRouter();
  const [email, setEmail] = useState<ColdEmail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [expandedFollowUp, setExpandedFollowUp] = useState<number | null>(null);

  useEffect(() => {
    if (!token || !id) return;
    getColdEmail(id, token)
      .then(setEmail)
      .catch(() => toast.error("Failed to load email"))
      .finally(() => setLoading(false));
  }, [token, id]);

  const handleDelete = async () => {
    if (!token || !id) return;
    if (!confirm("Are you sure you want to delete this email?")) return;
    setDeleting(true);
    try {
      await deleteColdEmail(id, token);
      toast.success("Email deleted");
      router.push("/cold-email/history");
    } catch {
      toast.error("Failed to delete email");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-elevated" />
        <div className="h-16 animate-pulse rounded-xl bg-elevated" />
        <div className="h-48 animate-pulse rounded-xl bg-elevated" />
        <div className="h-32 animate-pulse rounded-xl bg-elevated" />
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-secondary">Email not found</p>
          <Link
            href="/cold-email/history"
            className="mt-4 inline-block text-brand-primary hover:underline"
          >
            Back to history
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/cold-email/history"
            className="mb-2 inline-flex items-center gap-1 text-sm text-secondary hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Back to history
          </Link>
          <h1 className="text-2xl font-bold text-primary">
            {email.companyName || email.label || "Cold Email"}
          </h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-secondary">
            {email.jobTitle && <span>{email.jobTitle}</span>}
            {email.tone && (
              <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs text-brand-primary">
                {email.tone}
              </span>
            )}
            {email.style && (
              <span className="rounded-full bg-brand-secondary/10 px-2 py-0.5 text-xs text-brand-secondary">
                {email.style}
              </span>
            )}
            <span>
              {new Date(email.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
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

      {/* Recruiter info */}
      {(email.recruiterName || email.recruiterEmail) && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-secondary">
            {email.recruiterName && (
              <span className="text-primary">{email.recruiterName}</span>
            )}
            {email.recruiterName && email.recruiterEmail && " — "}
            {email.recruiterEmail && (
              <span className="text-brand-primary">{email.recruiterEmail}</span>
            )}
          </p>
        </div>
      )}

      {/* Subject */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-secondary">Subject Line</h2>
          <CopyButton text={email.subject} label="Subject" />
        </div>
        <p className="text-lg font-semibold text-primary">{email.subject}</p>
      </div>

      {/* Body */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-secondary">Email Body</h2>
          <CopyButton text={email.body} label="Email body" />
        </div>
        <div className="whitespace-pre-wrap rounded-lg bg-elevated p-4 text-sm leading-relaxed text-primary">
          {email.body}
        </div>
      </div>

      {/* Follow-ups */}
      {email.followUp1 && (
        <div className="rounded-xl border border-border bg-card">
          <button
            onClick={() =>
              setExpandedFollowUp(expandedFollowUp === 1 ? null : 1)
            }
            className="flex w-full items-center justify-between p-5"
          >
            <h2 className="text-sm font-medium text-secondary">
              Follow-up 1
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
                <CopyButton text={email.followUp1} label="Follow-up 1" />
              </div>
              <div className="whitespace-pre-wrap rounded-lg bg-elevated p-4 text-sm leading-relaxed text-primary">
                {email.followUp1}
              </div>
            </div>
          )}
        </div>
      )}

      {email.followUp2 && (
        <div className="rounded-xl border border-border bg-card">
          <button
            onClick={() =>
              setExpandedFollowUp(expandedFollowUp === 2 ? null : 2)
            }
            className="flex w-full items-center justify-between p-5"
          >
            <h2 className="text-sm font-medium text-secondary">
              Follow-up 2
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
                  text={email.followUp2}
                  label="Follow-up 2"
                />
              </div>
              <div className="whitespace-pre-wrap rounded-lg bg-elevated p-4 text-sm leading-relaxed text-primary">
                {email.followUp2}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
