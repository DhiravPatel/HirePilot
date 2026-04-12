"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileSearch,
  Mail,
  Briefcase,
  ArrowRight,
  TrendingUp,
  Clock,
  Target,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { getDashboardStats, getDashboardActivity } from "@/lib/api";
import { useSessionToken } from "@/hooks/use-session-token";
import type { DashboardStats, DashboardActivity } from "@/types";

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-secondary">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-20 animate-pulse rounded bg-elevated" />
          ) : (
            <p className="mt-2 text-3xl font-bold text-primary">{value}</p>
          )}
        </div>
        <div className="rounded-lg bg-brand-primary/10 p-3">
          <Icon className="h-6 w-6 text-brand-primary" />
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand-primary/50 hover:bg-elevated"
    >
      <div className="rounded-lg bg-brand-secondary/10 p-3">
        <Icon className="h-5 w-5 text-brand-secondary" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-primary">{title}</p>
        <p className="text-sm text-secondary">{description}</p>
      </div>
      <ArrowRight className="h-5 w-5 text-secondary transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

export default function DashboardPage() {
  const { token } = useSessionToken();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<DashboardActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const t = token;

    async function fetchData() {
      try {
        const [statsData, activityData] = await Promise.all([
          getDashboardStats(t),
          getDashboardActivity(t),
        ]);
        setStats(statsData);
        setActivity(activityData);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [token]);

  const recentScans = activity.filter((a) => a.type === "ats_scan");
  const recentEmails = activity.filter((a) => a.type === "cold_email");

  const chartData: { date: string; score: number }[] = [];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
        <p className="mt-1 text-secondary">
          Your job search command center
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total ATS Scans"
          value={stats?.totalAtsScans ?? 0}
          icon={FileSearch}
          loading={loading}
        />
        <StatCard
          label="Average ATS Score"
          value={stats?.avgAtsScore ? `${Math.round(stats.avgAtsScore)}%` : "N/A"}
          icon={Target}
          loading={loading}
        />
        <StatCard
          label="Cold Emails Generated"
          value={stats?.totalColdEmails ?? 0}
          icon={Mail}
          loading={loading}
        />
        <StatCard
          label="Applications Tracked"
          value={stats?.totalApplications ?? 0}
          icon={Briefcase}
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-primary">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <QuickActionCard
            title="Scan Resume"
            description="Check your ATS compatibility score"
            href="/resume-scan"
            icon={FileSearch}
          />
          <QuickActionCard
            title="Write Cold Email"
            description="Generate a personalized outreach email"
            href="/cold-email"
            icon={Mail}
          />
          <QuickActionCard
            title="Track Application"
            description="Add a new job to your tracker"
            href="/tracker"
            icon={Briefcase}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Score Trend Chart */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-primary" />
            <h2 className="text-lg font-semibold text-primary">
              Resume Score Trend
            </h2>
          </div>
          {loading ? (
            <div className="h-64 animate-pulse rounded-lg bg-elevated" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3d" />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a23",
                    border: "1px solid #2d2d3d",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: "#6366f1", r: 4 }}
                  activeDot={{ r: 6, fill: "#8b5cf6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-secondary">
              No scan data yet. Scan your first resume to see trends.
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          {/* Recent Scans */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand-accent" />
                <h2 className="text-lg font-semibold text-primary">
                  Recent ATS Scans
                </h2>
              </div>
              <Link
                href="/resume-scan/history"
                className="text-sm text-brand-primary hover:underline"
              >
                View all
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 animate-pulse rounded-lg bg-elevated"
                  />
                ))}
              </div>
            ) : recentScans.length > 0 ? (
              <div className="space-y-2">
                {recentScans.slice(0, 5).map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-elevated"
                  >
                    <div>
                      <p className="text-sm font-medium text-primary">
                        {item.title || "General Scan"}
                      </p>
                      <p className="text-xs text-secondary">
                        {new Date(item.timestamp).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <p className="text-xs text-secondary">{item.subtitle}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-secondary">
                No scans yet
              </p>
            )}
          </div>

          {/* Recent Emails */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-brand-secondary" />
                <h2 className="text-lg font-semibold text-primary">
                  Recent Cold Emails
                </h2>
              </div>
              <Link
                href="/cold-email/history"
                className="text-sm text-brand-primary hover:underline"
              >
                View all
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 animate-pulse rounded-lg bg-elevated"
                  />
                ))}
              </div>
            ) : recentEmails.length > 0 ? (
              <div className="space-y-2">
                {recentEmails.slice(0, 5).map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-elevated"
                  >
                    <div>
                      <p className="text-sm font-medium text-primary">
                        {item.title || "Untitled"}
                      </p>
                      <p className="text-xs text-secondary">
                        {item.subtitle || "No title"}
                      </p>
                    </div>
                    <span className="text-xs text-secondary">
                      {new Date(item.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-secondary">
                No emails yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
