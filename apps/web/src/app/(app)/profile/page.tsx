"use client";

import { useEffect, useState, useCallback } from "react";
import {
  User,
  Briefcase,
  Link2,
  Mail,
  Save,
  Loader2,
  X,
  Plus,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { getMe, updateMe } from "@/lib/api";
import { useSessionToken } from "@/hooks/use-session-token";
import type { User as UserType, EmailTone, EmailStyle } from "@/types";
import { cn } from "@/lib/utils";

const TONES: EmailTone[] = ["PROFESSIONAL", "FRIENDLY", "BOLD", "HUMBLE"];
const STYLES: EmailStyle[] = ["CONCISE", "DETAILED", "STORYTELLING"];

const TONE_LABELS: Record<EmailTone, string> = {
  PROFESSIONAL: "Professional",
  FRIENDLY: "Friendly",
  BOLD: "Bold",
  HUMBLE: "Humble",
};

const STYLE_LABELS: Record<EmailStyle, string> = {
  CONCISE: "Concise",
  DETAILED: "Detailed",
  STORYTELLING: "Storytelling",
};

function SectionCard({
  title,
  icon: Icon,
  children,
  onSave,
  saving,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-brand-primary" />
          <h2 className="text-lg font-semibold text-primary">{title}</h2>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save
        </button>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-primary">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-elevated px-4 py-2.5 text-primary placeholder:text-secondary/50 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
      />
    </div>
  );
}

export default function ProfilePage() {
  const { token } = useSessionToken();
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  // Personal info
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  // Career details
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  // Links
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");

  // Email preferences
  const [emailTone, setEmailTone] = useState<EmailTone>("PROFESSIONAL");
  const [emailStyle, setEmailStyle] = useState<EmailStyle>("CONCISE");

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState("");

  useEffect(() => {
    if (!token) return;
    getMe(token)
      .then((user: UserType) => {
        setName(user.name || "");
        setHeadline(user.headline || "");
        setLocation(user.location || "");
        setPhone(user.phone || "");
        setBio(user.bio || "");
        setCurrentRole(user.currentRole || "");
        setTargetRole(user.targetRole || "");
        setYearsOfExperience(user.yearsOfExperience?.toString() || "");
        setSkills(user.skills || []);
        setLinkedin(user.linkedinUrl || "");
        setGithub(user.githubUrl || "");
        setPortfolio(user.portfolioUrl || "");
        if (user.emailTone) setEmailTone(user.emailTone as EmailTone);
        if (user.emailStyle) setEmailStyle(user.emailStyle as EmailStyle);
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [token]);

  const saveSection = useCallback(
    async (section: string, data: Record<string, unknown>) => {
      if (!token) return;
      setSavingSection(section);
      try {
        await updateMe(data, token);
        toast.success("Saved successfully");
      } catch {
        toast.error("Failed to save");
      } finally {
        setSavingSection(null);
      }
    },
    [token]
  );

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      toast.error("Skill already added");
      return;
    }
    setSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div className="h-10 w-48 animate-pulse rounded bg-elevated" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-xl bg-elevated"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Profile</h1>
        <p className="mt-1 text-secondary">
          Manage your personal information and preferences
        </p>
      </div>

      {/* Personal Info */}
      <SectionCard
        title="Personal Information"
        icon={User}
        onSave={() =>
          saveSection("personal", { name, headline, location, phone, bio })
        }
        saving={savingSection === "personal"}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FieldInput
            label="Full Name"
            value={name}
            onChange={setName}
            placeholder="John Doe"
          />
          <FieldInput
            label="Headline"
            value={headline}
            onChange={setHeadline}
            placeholder="Senior Software Engineer"
          />
          <FieldInput
            label="Location"
            value={location}
            onChange={setLocation}
            placeholder="San Francisco, CA"
          />
          <FieldInput
            label="Phone"
            value={phone}
            onChange={setPhone}
            placeholder="+1 (555) 123-4567"
            type="tel"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-primary">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A brief professional summary..."
            rows={3}
            className="w-full rounded-lg border border-border bg-elevated px-4 py-2.5 text-primary placeholder:text-secondary/50 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          />
        </div>
      </SectionCard>

      {/* Career Details */}
      <SectionCard
        title="Career Details"
        icon={Briefcase}
        onSave={() =>
          saveSection("career", {
            currentRole,
            targetRole,
            yearsOfExperience: yearsOfExperience
              ? Number(yearsOfExperience)
              : undefined,
            skills,
          })
        }
        saving={savingSection === "career"}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FieldInput
            label="Current Role"
            value={currentRole}
            onChange={setCurrentRole}
            placeholder="Software Engineer at Acme"
          />
          <FieldInput
            label="Target Role"
            value={targetRole}
            onChange={setTargetRole}
            placeholder="Senior Software Engineer"
          />
          <FieldInput
            label="Years of Experience"
            value={yearsOfExperience}
            onChange={setYearsOfExperience}
            placeholder="5"
            type="number"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-primary">
            Skills
          </label>
          <div className="mb-2 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 px-3 py-1 text-sm text-brand-primary"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="ml-0.5 hover:text-danger"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              placeholder="Add a skill..."
              className="flex-1 rounded-lg border border-border bg-elevated px-4 py-2 text-sm text-primary placeholder:text-secondary/50 focus:border-brand-primary focus:outline-none"
            />
            <button
              onClick={addSkill}
              className="rounded-lg border border-border px-3 py-2 text-secondary hover:bg-elevated hover:text-primary"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Links */}
      <SectionCard
        title="Links"
        icon={Link2}
        onSave={() => saveSection("links", { linkedinUrl: linkedin, githubUrl: github, portfolioUrl: portfolio })}
        saving={savingSection === "links"}
      >
        <FieldInput
          label="LinkedIn"
          value={linkedin}
          onChange={setLinkedin}
          placeholder="https://linkedin.com/in/username"
          type="url"
        />
        <FieldInput
          label="GitHub"
          value={github}
          onChange={setGithub}
          placeholder="https://github.com/username"
          type="url"
        />
        <FieldInput
          label="Portfolio"
          value={portfolio}
          onChange={setPortfolio}
          placeholder="https://myportfolio.com"
          type="url"
        />
      </SectionCard>

      {/* Email Preferences */}
      <SectionCard
        title="Email Preferences"
        icon={Mail}
        onSave={() => saveSection("email", { emailTone, emailStyle })}
        saving={savingSection === "email"}
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-primary">
            Default Tone
          </label>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                onClick={() => setEmailTone(t)}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                  emailTone === t
                    ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                    : "border-border text-secondary hover:bg-elevated hover:text-primary"
                )}
              >
                {TONE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-primary">
            Default Style
          </label>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button
                key={s}
                onClick={() => setEmailStyle(s)}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                  emailStyle === s
                    ? "border-brand-secondary bg-brand-secondary/10 text-brand-secondary"
                    : "border-border text-secondary hover:bg-elevated hover:text-primary"
                )}
              >
                {STYLE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Danger Zone */}
      <div className="rounded-xl border border-danger/30 bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-danger" />
          <h2 className="text-lg font-semibold text-danger">Danger Zone</h2>
        </div>
        <p className="mb-4 text-sm text-secondary">
          Once you delete your account, there is no going back. All your data
          including resumes, scans, emails, and applications will be permanently
          deleted.
        </p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-danger px-4 py-2 text-sm font-medium text-danger hover:bg-danger/10"
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </button>
        ) : (
          <div className="space-y-3 rounded-lg border border-danger/20 bg-danger/5 p-4">
            <p className="text-sm text-primary">
              Type <span className="font-mono font-bold">DELETE</span> to
              confirm:
            </p>
            <input
              type="text"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              placeholder="DELETE"
              className="w-full rounded-lg border border-danger/30 bg-elevated px-4 py-2 text-sm text-primary placeholder:text-secondary/50 focus:border-danger focus:outline-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteText("");
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm text-secondary hover:bg-elevated"
              >
                Cancel
              </button>
              <button
                disabled={deleteText !== "DELETE"}
                onClick={() => {
                  toast.error(
                    "Account deletion is not available in this version"
                  );
                }}
                className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Permanently Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
