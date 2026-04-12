"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import {
  User as UserIcon,
  Briefcase,
  Link as LinkIcon,
  Save,
  Loader2,
  LogOut,
  X,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { getMe, updateMe } from "@/lib/api";
import { useSessionToken } from "@/hooks/use-session-token";
import type { User } from "@/types";

export default function ProfilePage() {
  const { token, user: sessionUser } = useSessionToken();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [skills, setSkills] = useState<string[]>([]);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getMe(token);
      setProfile(data);
      setName(data.name || "");
      setHeadline(data.headline || "");
      setLocation(data.location || "");
      setPhone(data.phone || "");
      setBio(data.bio || "");
      setCurrentRole(data.currentRole || "");
      setTargetRole(data.targetRole || "");
      setYearsOfExperience(data.yearsOfExperience || 0);
      setSkills(data.skills || []);
      setLinkedinUrl(data.linkedinUrl || "");
      setGithubUrl(data.githubUrl || "");
      setPortfolioUrl(data.portfolioUrl || "");
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveSection = async (section: string, data: Partial<User>) => {
    if (!token) return;
    setSavingSection(section);
    try {
      const updated = await updateMe(data, token);
      setProfile(updated);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSavingSection(null);
    }
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed || skills.includes(trimmed) || skills.length >= 20) return;
    setSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-elevated px-3 py-2.5 text-sm text-primary placeholder:text-secondary/50 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary";

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-elevated" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-xl bg-elevated" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Profile</h1>
        <p className="mt-1 text-secondary">Manage your account and preferences</p>
      </div>

      {/* Avatar & Email (read-only) */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          {sessionUser?.image ? (
            <Image
              src={sessionUser.image}
              alt={sessionUser.name || "User"}
              width={56}
              height={56}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/20">
              <UserIcon className="h-7 w-7 text-brand-primary" />
            </div>
          )}
          <div>
            <p className="font-semibold text-primary">{profile?.name || sessionUser?.name || "User"}</p>
            <p className="text-sm text-secondary">{profile?.email || sessionUser?.email}</p>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <UserIcon className="h-5 w-5 text-brand-primary" />
          <h2 className="text-lg font-semibold text-primary">Personal Info</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-secondary">Name</label>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-secondary">Headline</label>
              <input className={inputClass} value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Full-Stack Developer" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-secondary">Location</label>
              <input className={inputClass} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-secondary">Phone</label>
              <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">Bio</label>
            <textarea
              className={inputClass}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short bio about yourself..."
              rows={3}
              maxLength={300}
            />
            <p className="mt-1 text-right text-xs text-secondary">{bio.length}/300</p>
          </div>
          <button
            onClick={() =>
              saveSection("personal", { name, headline, location, phone, bio } as Partial<User>)
            }
            disabled={savingSection === "personal"}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-primary/90 disabled:opacity-50"
          >
            {savingSection === "personal" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Personal Info
          </button>
        </div>
      </div>

      {/* Career Details */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-brand-primary" />
          <h2 className="text-lg font-semibold text-primary">Career Details</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-secondary">Current Role</label>
              <input className={inputClass} value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} placeholder="e.g. Software Engineer" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-secondary">Target Role</label>
              <input className={inputClass} value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Senior Engineer" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">Years of Experience</label>
            <input
              type="number"
              className={inputClass}
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(parseInt(e.target.value) || 0)}
              min={0}
              max={50}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">Skills ({skills.length}/20)</label>
            <div className="flex gap-2">
              <input
                className={inputClass}
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                placeholder="Type a skill and press Enter"
              />
              <button
                onClick={addSkill}
                disabled={!skillInput.trim() || skills.length >= 20}
                className="rounded-lg border border-border px-3 py-2 text-secondary transition-colors hover:bg-elevated disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary"
                  >
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="hover:text-danger">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() =>
              saveSection("career", {
                currentRole,
                targetRole,
                yearsOfExperience,
                skills,
              } as Partial<User>)
            }
            disabled={savingSection === "career"}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-primary/90 disabled:opacity-50"
          >
            {savingSection === "career" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Career Details
          </button>
        </div>
      </div>

      {/* Links */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <LinkIcon className="h-5 w-5 text-brand-primary" />
          <h2 className="text-lg font-semibold text-primary">Links</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">LinkedIn</label>
            <input className={inputClass} value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/you" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">GitHub</label>
            <input className={inputClass} value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/you" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">Portfolio</label>
            <input className={inputClass} value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://yoursite.com" />
          </div>
          <button
            onClick={() =>
              saveSection("links", { linkedinUrl, githubUrl, portfolioUrl } as Partial<User>)
            }
            disabled={savingSection === "links"}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-primary/90 disabled:opacity-50"
          >
            {savingSection === "links" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Links
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <div className="rounded-xl border border-danger/20 bg-card p-6">
        <h2 className="mb-2 text-lg font-semibold text-primary">Sign Out</h2>
        <p className="mb-4 text-sm text-secondary">Sign out of your account on this device.</p>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="inline-flex items-center gap-2 rounded-lg border border-danger/30 px-4 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
