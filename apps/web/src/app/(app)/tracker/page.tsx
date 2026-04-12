"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  X,
  Loader2,
  GripVertical,
  Briefcase,
  MapPin,
  DollarSign,
  Wifi,
  ExternalLink,
  Pencil,
  Trash2,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import {
  listApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  updateApplicationStatus,
} from "@/lib/api";
import { useSessionToken } from "@/hooks/use-session-token";
import type { JobApplication, ApplicationStatus } from "@/types";
import { cn } from "@/lib/utils";

const COLUMNS: { id: ApplicationStatus; label: string; color: string }[] = [
  { id: "SAVED", label: "Saved", color: "bg-secondary/20" },
  { id: "APPLIED", label: "Applied", color: "bg-brand-primary/20" },
  { id: "PHONE_SCREEN", label: "Phone Screen", color: "bg-brand-accent/20" },
  { id: "INTERVIEW", label: "Interview", color: "bg-brand-secondary/20" },
  { id: "OFFER", label: "Offer", color: "bg-success/20" },
  { id: "REJECTED", label: "Rejected", color: "bg-danger/20" },
  { id: "WITHDRAWN", label: "Withdrawn", color: "bg-warning/20" },
];

function formatSalary(min?: number, max?: number): string {
  if (!min && !max) return "";
  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

function JobCard({
  app,
  onClick,
  overlay,
}: {
  app: JobApplication;
  onClick: () => void;
  overlay?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={overlay ? undefined : style}
      className="cursor-pointer rounded-lg border border-border bg-card p-3 transition-colors hover:border-brand-primary/30"
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 shrink-0 cursor-grab text-secondary hover:text-primary"
          {...(overlay ? {} : { ...attributes, ...listeners })}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-primary">
            {app.jobTitle}
          </p>
          <p className="truncate text-xs text-secondary">{app.companyName}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {app.isRemote && (
              <span className="inline-flex items-center gap-1 rounded bg-brand-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-brand-accent">
                <Wifi className="h-2.5 w-2.5" /> Remote
              </span>
            )}
            {(app.salaryMin || app.salaryMax) && (
              <span className="inline-flex items-center gap-1 rounded bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success">
                <DollarSign className="h-2.5 w-2.5" />
                {formatSalary(app.salaryMin ?? undefined, app.salaryMax ?? undefined)}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-[10px] text-secondary">
            {new Date(app.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({
  column,
  apps,
  onCardClick,
}: {
  column: (typeof COLUMNS)[number];
  apps: JobApplication[];
  onCardClick: (app: JobApplication) => void;
}) {
  return (
    <div className="flex w-64 shrink-0 flex-col rounded-xl border border-border bg-elevated">
      <div className="flex items-center justify-between border-b border-border p-3">
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", column.color)} />
          <h3 className="text-sm font-semibold text-primary">{column.label}</h3>
        </div>
        <span className="rounded-full bg-card px-2 py-0.5 text-xs text-secondary">
          {apps.length}
        </span>
      </div>
      <SortableContext
        items={apps.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 space-y-2 overflow-y-auto p-2" style={{ maxHeight: "calc(100vh - 320px)" }}>
          {apps.map((app) => (
            <JobCard key={app.id} app={app} onClick={() => onCardClick(app)} />
          ))}
          {apps.length === 0 && (
            <div className="py-6 text-center text-xs text-secondary">
              No applications
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

interface FormData {
  company: string;
  jobTitle: string;
  url: string;
  notes: string;
  salaryMin: string;
  salaryMax: string;
  location: string;
  isRemote: boolean;
}

const emptyForm: FormData = {
  company: "",
  jobTitle: "",
  url: "",
  notes: "",
  salaryMin: "",
  salaryMax: "",
  location: "",
  isRemote: false,
};

export default function TrackerPage() {
  const { token } = useSessionToken();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchApplications = useCallback(async () => {
    if (!token) return;
    try {
      const data = await listApplications(token);
      setApplications(data);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const columnApps = useMemo(() => {
    const map: Record<string, JobApplication[]> = {};
    for (const col of COLUMNS) {
      map[col.id] = applications.filter((a) => a.status === col.id);
    }
    return map;
  }, [applications]);

  const stats = useMemo(() => {
    const total = applications.length;
    const inProgress = applications.filter(
      (a) =>
        a.status !== "REJECTED" &&
        a.status !== "WITHDRAWN" &&
        a.status !== "OFFER"
    ).length;
    const offers = applications.filter((a) => a.status === "OFFER").length;
    const rejected = applications.filter((a) => a.status === "REJECTED").length;
    const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0;
    return { total, inProgress, offers, rejectionRate };
  }, [applications]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || !token) return;

    const app = applications.find((a) => a.id === active.id);
    if (!app) return;

    // Determine target column
    let targetStatus: ApplicationStatus | undefined;

    // Check if dropped over a column or another card
    const overApp = applications.find((a) => a.id === over.id);
    if (overApp) {
      targetStatus = overApp.status as ApplicationStatus;
    } else {
      // Dropped on a column directly
      const col = COLUMNS.find((c) => c.id === over.id);
      if (col) targetStatus = col.id;
    }

    if (!targetStatus || targetStatus === app.status) return;

    // Optimistic update
    setApplications((prev) =>
      prev.map((a) =>
        a.id === app.id ? { ...a, status: targetStatus! } : a
      )
    );

    try {
      await updateApplicationStatus(app.id, targetStatus, token);
    } catch {
      toast.error("Failed to update status");
      fetchApplications();
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // handled in dragEnd
  };

  const handleSubmit = async () => {
    if (!token) return;
    if (!form.company.trim() || !form.jobTitle.trim()) {
      toast.error("Company and job title are required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        companyName: form.company,
        jobTitle: form.jobTitle,
        jobUrl: form.url || undefined,
        notes: form.notes || undefined,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        location: form.location || undefined,
        isRemote: form.isRemote,
      };

      if (editMode && selectedApp) {
        await updateApplication(selectedApp.id, payload, token);
        toast.success("Application updated");
      } else {
        await createApplication(payload, token);
        toast.success("Application added");
      }

      setShowAddDialog(false);
      setSelectedApp(null);
      setEditMode(false);
      setForm(emptyForm);
      await fetchApplications();
    } catch {
      toast.error("Failed to save application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteApp = async (id: string) => {
    if (!token) return;
    if (!confirm("Delete this application?")) return;
    try {
      await deleteApplication(id, token);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      setSelectedApp(null);
      toast.success("Application deleted");
    } catch {
      toast.error("Failed to delete application");
    }
  };

  const activeApp = activeId
    ? applications.find((a) => a.id === activeId)
    : null;

  return (
    <div className="flex h-full flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Job Tracker</h1>
            <p className="mt-1 text-secondary">
              Track your job applications with drag-and-drop
            </p>
          </div>
          <button
            onClick={() => {
              setForm(emptyForm);
              setEditMode(false);
              setShowAddDialog(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add Application
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats.total },
            { label: "In Progress", value: stats.inProgress },
            { label: "Offers", value: stats.offers },
            { label: "Rejection Rate", value: `${stats.rejectionRate}%` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border bg-card px-4 py-3"
            >
              <p className="text-xs text-secondary">{stat.label}</p>
              <p className="mt-1 text-xl font-bold text-primary">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Kanban */}
        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map((col) => (
              <div
                key={col.id}
                className="h-96 w-64 shrink-0 animate-pulse rounded-xl bg-elevated"
              />
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
          >
            <div className="flex gap-4 overflow-x-auto pb-4">
              {COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  apps={columnApps[col.id] || []}
                  onCardClick={(app) => setSelectedApp(app)}
                />
              ))}
            </div>
            <DragOverlay>
              {activeApp && (
                <div className="w-60">
                  <JobCard
                    app={activeApp}
                    onClick={() => {}}
                    overlay
                  />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Add/Edit Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-xl border border-border bg-base p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-primary">
                {editMode ? "Edit Application" : "Add Application"}
              </h2>
              <button
                onClick={() => {
                  setShowAddDialog(false);
                  setEditMode(false);
                }}
                className="text-secondary hover:text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-primary">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, company: e.target.value }))
                    }
                    placeholder="Acme Inc"
                    className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-primary placeholder:text-secondary/50 focus:border-brand-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-primary">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={form.jobTitle}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, jobTitle: e.target.value }))
                    }
                    placeholder="Software Engineer"
                    className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-primary placeholder:text-secondary/50 focus:border-brand-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-primary">
                  URL
                </label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, url: e.target.value }))
                  }
                  placeholder="https://..."
                  className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-primary placeholder:text-secondary/50 focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-primary">
                    Salary Min
                  </label>
                  <input
                    type="number"
                    value={form.salaryMin}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, salaryMin: e.target.value }))
                    }
                    placeholder="80000"
                    className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-primary placeholder:text-secondary/50 focus:border-brand-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-primary">
                    Salary Max
                  </label>
                  <input
                    type="number"
                    value={form.salaryMax}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, salaryMax: e.target.value }))
                    }
                    placeholder="120000"
                    className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-primary placeholder:text-secondary/50 focus:border-brand-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-primary">
                    Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, location: e.target.value }))
                    }
                    placeholder="San Francisco, CA"
                    className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-primary placeholder:text-secondary/50 focus:border-brand-primary focus:outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 pb-2">
                    <input
                      type="checkbox"
                      checked={form.isRemote}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, isRemote: e.target.checked }))
                      }
                      className="h-4 w-4 rounded border-border bg-elevated accent-brand-primary"
                    />
                    <span className="text-sm text-primary">Remote</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-primary">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Any notes about this application..."
                  rows={3}
                  className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-primary placeholder:text-secondary/50 focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAddDialog(false);
                    setEditMode(false);
                  }}
                  className="rounded-lg border border-border px-4 py-2 text-sm text-secondary hover:bg-elevated"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editMode ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Panel */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-xl border border-border bg-base p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-primary">
                  {selectedApp.jobTitle}
                </h2>
                <p className="text-secondary">{selectedApp.companyName}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-secondary hover:text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium",
                    COLUMNS.find((c) => c.id === selectedApp.status)?.color,
                    "text-primary"
                  )}
                >
                  {COLUMNS.find((c) => c.id === selectedApp.status)?.label ?? selectedApp.status}
                </span>
                {selectedApp.isRemote && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-accent/10 px-2 py-0.5 text-xs text-brand-accent">
                    <Wifi className="h-3 w-3" /> Remote
                  </span>
                )}
              </div>

              {selectedApp.jobUrl && (
                <a
                  href={selectedApp.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-brand-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> View posting
                </a>
              )}

              {selectedApp.location && (
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <MapPin className="h-4 w-4" /> {selectedApp.location}
                </div>
              )}

              {(selectedApp.salaryMin || selectedApp.salaryMax) && (
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <DollarSign className="h-4 w-4" />{" "}
                  {formatSalary(selectedApp.salaryMin ?? undefined, selectedApp.salaryMax ?? undefined)}
                </div>
              )}

              {selectedApp.notes && (
                <div className="rounded-lg bg-elevated p-3 text-sm text-primary">
                  {selectedApp.notes}
                </div>
              )}

              <p className="text-xs text-secondary">
                Added{" "}
                {new Date(selectedApp.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => handleDeleteApp(selectedApp.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-danger/30 px-4 py-2 text-sm text-danger hover:bg-danger/10"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
              <button
                onClick={() => {
                  setForm({
                    company: selectedApp.companyName,
                    jobTitle: selectedApp.jobTitle,
                    url: selectedApp.jobUrl || "",
                    notes: selectedApp.notes || "",
                    salaryMin: selectedApp.salaryMin?.toString() || "",
                    salaryMax: selectedApp.salaryMax?.toString() || "",
                    location: selectedApp.location || "",
                    isRemote: selectedApp.isRemote || false,
                  });
                  setEditMode(true);
                  setShowAddDialog(true);
                  setSelectedApp(null);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                <Pencil className="h-4 w-4" /> Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
