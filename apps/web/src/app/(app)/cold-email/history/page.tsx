"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Clock, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { listColdEmails, deleteColdEmail } from "@/lib/api";
import { useSessionToken } from "@/hooks/use-session-token";
import type { ColdEmail } from "@/types";

export default function ColdEmailHistoryPage() {
  const { token } = useSessionToken();
  const [emails, setEmails] = useState<ColdEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEmails = async () => {
    if (!token) return;
    try {
      const data = await listColdEmails(token);
      setEmails(data);
    } catch {
      toast.error("Failed to load email history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [token]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) return;
    if (!confirm("Delete this email?")) return;
    setDeletingId(id);
    try {
      await deleteColdEmail(id, token);
      setEmails((prev) => prev.filter((em) => em.id !== id));
      toast.success("Email deleted");
    } catch {
      toast.error("Failed to delete email");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <Link
          href="/cold-email"
          className="mb-2 inline-flex items-center gap-1 text-sm text-secondary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to generator
        </Link>
        <h1 className="text-3xl font-bold text-primary">Email History</h1>
        <p className="mt-1 text-secondary">
          View and manage your saved cold emails
        </p>
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
      ) : emails.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
          <Mail className="mb-4 h-12 w-12 text-secondary" />
          <h2 className="text-lg font-semibold text-primary">
            No saved emails
          </h2>
          <p className="mt-1 text-sm text-secondary">
            Generate and save your first cold email
          </p>
          <Link
            href="/cold-email"
            className="mt-4 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Generate Email
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {emails.map((email) => (
            <Link
              key={email.id}
              href={`/cold-email/${email.id}`}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand-primary/30 hover:bg-elevated"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-brand-secondary/10 p-2.5">
                  <Mail className="h-5 w-5 text-brand-secondary" />
                </div>
                <div>
                  <p className="font-medium text-primary">
                    {email.companyName || email.label || "Untitled"}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-secondary">
                    <Clock className="h-3 w-3" />
                    {new Date(email.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {email.jobTitle && (
                      <>
                        <span>&middot;</span>
                        <span>{email.jobTitle}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {email.tone && (
                  <span className="rounded-full bg-brand-primary/10 px-2.5 py-1 text-xs font-medium text-brand-primary">
                    {email.tone}
                  </span>
                )}
                <button
                  onClick={(e) => handleDelete(email.id, e)}
                  disabled={deletingId === email.id}
                  className="rounded-lg p-2 text-secondary transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                >
                  {deletingId === email.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
