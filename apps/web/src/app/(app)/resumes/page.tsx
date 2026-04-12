"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  Star,
  Trash2,
  Loader2,
  File,
} from "lucide-react";
import { toast } from "sonner";
import {
  listResumes,
  uploadResume,
  deleteResume,
  setDefaultResume,
} from "@/lib/api";
import { useSessionToken } from "@/hooks/use-session-token";
import type { Resume } from "@/types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ResumesPage() {
  const { token } = useSessionToken();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchResumes = useCallback(async () => {
    if (!token) return;
    try {
      const data = await listResumes(token);
      setResumes(data);
    } catch {
      toast.error("Failed to load resumes");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!token) return;
      const file = acceptedFiles[0];
      if (!file) return;

      if (resumes.length >= 5) {
        toast.error("Maximum 5 resumes allowed. Delete one to upload a new one.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB");
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        await uploadResume(formData, token);
        toast.success("Resume uploaded successfully");
        await fetchResumes();
      } catch {
        toast.error("Failed to upload resume");
      } finally {
        setUploading(false);
      }
    },
    [token, resumes.length, fetchResumes]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    disabled: uploading,
  });

  const handleSetDefault = async (resumeId: string) => {
    if (!token) return;
    setActionId(resumeId);
    try {
      await setDefaultResume(resumeId, token);
      toast.success("Default resume updated");
      await fetchResumes();
    } catch {
      toast.error("Failed to set default resume");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this resume?")) return;
    setActionId(resumeId);
    try {
      await deleteResume(resumeId, token);
      toast.success("Resume deleted");
      await fetchResumes();
    } catch {
      toast.error("Failed to delete resume");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">My Resumes</h1>
        <p className="mt-1 text-secondary">
          Manage your uploaded resumes ({resumes.length}/5)
        </p>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          uploading
            ? "cursor-not-allowed border-border opacity-50"
            : isDragActive
              ? "border-brand-primary bg-brand-primary/5"
              : "border-border hover:border-brand-primary/50 hover:bg-elevated"
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
            <p className="font-medium text-primary">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-10 w-10 text-secondary" />
            <p className="font-medium text-primary">
              {isDragActive ? "Drop to upload" : "Upload a new resume"}
            </p>
            <p className="text-sm text-secondary">
              PDF only, max 5MB
            </p>
          </div>
        )}
      </div>

      {/* Resume List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-elevated"
            />
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-border bg-card py-12">
          <File className="mb-3 h-10 w-10 text-secondary" />
          <p className="text-lg font-semibold text-primary">No resumes yet</p>
          <p className="mt-1 text-sm text-secondary">
            Upload your first resume to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-brand-primary/10 p-2.5">
                  <FileText className="h-5 w-5 text-brand-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-primary">{resume.name}</p>
                    {resume.isDefault && (
                      <span className="rounded-full bg-brand-primary/20 px-2 py-0.5 text-xs font-medium text-brand-primary">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-secondary">
                    <span>
                      {new Date(resume.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {resume.fileSize && (
                      <>
                        <span>&middot;</span>
                        <span>{formatFileSize(resume.fileSize)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!resume.isDefault && (
                  <button
                    onClick={() => handleSetDefault(resume.id)}
                    disabled={actionId === resume.id}
                    className="rounded-lg border border-border p-2 text-secondary transition-colors hover:bg-elevated hover:text-primary disabled:opacity-50"
                    title="Set as default"
                  >
                    {actionId === resume.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Star className="h-4 w-4" />
                    )}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(resume.id)}
                  disabled={actionId === resume.id}
                  className="rounded-lg border border-danger/30 p-2 text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
                  title="Delete resume"
                >
                  {actionId === resume.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
