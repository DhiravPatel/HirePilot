"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  Loader2,
  Sparkles,
  ChevronDown,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { scanAts, listResumes, uploadResume } from "@/lib/api";
import { useSessionToken } from "@/hooks/use-session-token";
import type { Resume } from "@/types";
import { cn } from "@/lib/utils";

const PROGRESS_MESSAGES = [
  "Uploading resume...",
  "Parsing document structure...",
  "Analyzing formatting...",
  "Checking keyword density...",
  "Evaluating ATS compatibility...",
  "Scoring sections...",
  "Generating recommendations...",
  "Finalizing results...",
];

export default function ResumeScanPage() {
  const { token } = useSessionToken();
  const router = useRouter();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [targetJobTitle, setTargetJobTitle] = useState("");
  const [scanning, setScanning] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [loadingResumes, setLoadingResumes] = useState(true);

  useEffect(() => {
    if (!token) return;
    listResumes(token)
      .then((data) => {
        setResumes(data);
        const defaultResume = data.find((r: Resume) => r.isDefault);
        if (defaultResume) setSelectedResumeId(defaultResume.id);
      })
      .catch(() => toast.error("Failed to load resumes"))
      .finally(() => setLoadingResumes(false));
  }, [token]);

  useEffect(() => {
    if (!scanning) return;
    const interval = setInterval(() => {
      setProgressIndex((prev) =>
        prev < PROGRESS_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [scanning]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are accepted");
      return;
    }
    setUploadedFile(file);
    setSelectedResumeId("");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleScan = async () => {
    if (!token) return;
    if (!uploadedFile && !selectedResumeId) {
      toast.error("Please upload a resume or select an existing one");
      return;
    }

    setScanning(true);
    setProgressIndex(0);

    try {
      let resumeId = selectedResumeId;

      if (uploadedFile && !resumeId) {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        const uploaded = await uploadResume(formData, token);
        resumeId = uploaded.id;
      }

      const result = await scanAts(
        {
          resumeId,
          jobDescription: jobDescription || undefined,
          jobTitle: targetJobTitle || undefined,
        },
        token,
      );

      toast.success("Scan complete!");
      router.push(`/resume-scan/${result.id}`);
    } catch {
      toast.error("Failed to scan resume. Please try again.");
      setScanning(false);
    }
  };

  if (scanning) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="relative mx-auto mb-8 h-24 w-24">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-brand-primary/20 border-t-brand-primary" />
            <div className="absolute inset-3 animate-spin rounded-full border-4 border-brand-secondary/20 border-t-brand-secondary" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
            <Sparkles className="absolute inset-0 m-auto h-8 w-8 animate-pulse text-brand-primary" />
          </div>
          <p className="text-lg font-semibold text-primary">
            Analyzing Your Resume
          </p>
          <p className="mt-3 text-sm text-brand-primary transition-all duration-500">
            {PROGRESS_MESSAGES[progressIndex]}
          </p>
          <div className="mx-auto mt-6 h-1.5 w-64 overflow-hidden rounded-full bg-elevated">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-1000"
              style={{
                width: `${((progressIndex + 1) / PROGRESS_MESSAGES.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Resume Scanner</h1>
        <p className="mt-1 text-secondary">
          Check how well your resume performs with ATS systems
        </p>
      </div>

      {/* Upload or Select */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-primary">
          1. Choose Your Resume
        </h2>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            "cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors",
            isDragActive
              ? "border-brand-primary bg-brand-primary/5"
              : uploadedFile
                ? "border-success/50 bg-success/5"
                : "border-border hover:border-brand-primary/50 hover:bg-elevated"
          )}
        >
          <input {...getInputProps()} />
          {uploadedFile ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-10 w-10 text-success" />
              <p className="font-medium text-primary">{uploadedFile.name}</p>
              <p className="text-sm text-secondary">
                {(uploadedFile.size / 1024).toFixed(1)} KB
              </p>
              <p className="text-xs text-secondary">
                Click or drag to replace
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-10 w-10 text-secondary" />
              <p className="font-medium text-primary">
                {isDragActive
                  ? "Drop your resume here"
                  : "Drag & drop your resume PDF"}
              </p>
              <p className="text-sm text-secondary">or click to browse (max 5MB)</p>
            </div>
          )}
        </div>

        {/* Or divider */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm text-secondary">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Select existing resume */}
        <div className="relative">
          <label className="mb-2 block text-sm font-medium text-primary">
            Select an existing resume
          </label>
          {loadingResumes ? (
            <div className="h-11 animate-pulse rounded-lg bg-elevated" />
          ) : (
            <div className="relative">
              <select
                value={selectedResumeId}
                onChange={(e) => {
                  setSelectedResumeId(e.target.value);
                  if (e.target.value) setUploadedFile(null);
                }}
                className="w-full appearance-none rounded-lg border border-border bg-elevated px-4 py-2.5 pr-10 text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="">Choose a resume...</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                    {r.isDefault ? " (Default)" : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
            </div>
          )}
        </div>
      </div>

      {/* Optional Fields */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-primary">
          2. Add Context{" "}
          <span className="text-sm font-normal text-secondary">(optional)</span>
        </h2>

        <div>
          <label className="mb-2 block text-sm font-medium text-primary">
            Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description to get a targeted ATS analysis..."
            rows={5}
            className="w-full rounded-lg border border-border bg-elevated px-4 py-3 text-primary placeholder:text-secondary/50 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-primary">
            Target Job Title
          </label>
          <input
            type="text"
            value={targetJobTitle}
            onChange={(e) => setTargetJobTitle(e.target.value)}
            placeholder="e.g. Senior Software Engineer"
            className="w-full rounded-lg border border-border bg-elevated px-4 py-3 text-primary placeholder:text-secondary/50 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          />
        </div>
      </div>

      {/* Scan Button */}
      <button
        onClick={handleScan}
        disabled={!uploadedFile && !selectedResumeId}
        className="w-full rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-3.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="flex items-center justify-center gap-2">
          <Search className="h-5 w-5" />
          Scan Resume
        </span>
      </button>
    </div>
  );
}
