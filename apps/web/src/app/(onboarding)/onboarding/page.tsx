"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSessionToken } from "@/hooks/use-session-token";
import { updateMe, completeOnboarding } from "@/lib/api";
import { toast } from "sonner";
import {
  Sparkles,
  User,
  Target,
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
  Loader2,
} from "lucide-react";

const STEPS = [
  { icon: User, label: "Basic Info" },
  { icon: Target, label: "Career Goals" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { token } = useSessionToken();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    headline: "",
    location: "",
    phone: "",
    years_of_experience: 0,
    current_role: "",
    target_role: "",
    skills: [] as string[],
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
  });

  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = useCallback(() => {
    const trimmed = skillInput.trim();
    if (trimmed && formData.skills.length < 20 && !formData.skills.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setSkillInput("");
    }
  }, [skillInput, formData.skills]);

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleSubmit = async () => {
    if (!token) {
      toast.error("Session expired. Please sign in again.");
      return;
    }

    setLoading(true);
    try {
      await updateMe(formData, token);
      await completeOnboarding(token);
      toast.success("Onboarding complete! Welcome to HirePilot.");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to save your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return formData.name.trim().length > 0;
    return true;
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-7 w-7 text-brand-primary" />
          <span className="text-xl font-display font-bold gradient-text">HirePilot</span>
        </div>
        <h1 className="text-2xl font-display font-bold mb-2">Set Up Your Profile</h1>
        <p className="text-text-secondary text-sm">Help us personalize your experience</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  i <= step
                    ? "bg-brand-primary text-white"
                    : "bg-bg-elevated text-text-secondary"
                }`}
              >
                <s.icon className="h-4 w-4" />
              </div>
              <span
                className={`text-sm hidden sm:block ${
                  i <= step ? "text-text-primary" : "text-text-secondary"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-bg-card border border-border rounded-xl p-6">
        {/* Step 1: Basic Info */}
        {step === 0 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="John Doe"
                className="w-full px-3 py-2.5 bg-bg-elevated border border-border rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Headline</label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => updateField("headline", e.target.value)}
                placeholder="Full Stack Developer | React & Go"
                className="w-full px-3 py-2.5 bg-bg-elevated border border-border rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="San Francisco, CA"
                  className="w-full px-3 py-2.5 bg-bg-elevated border border-border rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2.5 bg-bg-elevated border border-border rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Years of Experience</label>
              <input
                type="number"
                min={0}
                max={50}
                value={formData.years_of_experience}
                onChange={(e) => updateField("years_of_experience", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-bg-elevated border border-border rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
              />
            </div>
          </div>
        )}

        {/* Step 2: Career Goals */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Current Role</label>
                <input
                  type="text"
                  value={formData.current_role}
                  onChange={(e) => updateField("current_role", e.target.value)}
                  placeholder="Software Engineer"
                  className="w-full px-3 py-2.5 bg-bg-elevated border border-border rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Target Role</label>
                <input
                  type="text"
                  value={formData.target_role}
                  onChange={(e) => updateField("target_role", e.target.value)}
                  placeholder="Senior Software Engineer"
                  className="w-full px-3 py-2.5 bg-bg-elevated border border-border rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Skills ({formData.skills.length}/20)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Type a skill and press Enter"
                  className="flex-1 px-3 py-2.5 bg-bg-elevated border border-border rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  disabled={formData.skills.length >= 20}
                  className="px-3 py-2.5 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-md text-xs font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-danger transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">LinkedIn URL</label>
              <input
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => updateField("linkedin_url", e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full px-3 py-2.5 bg-bg-elevated border border-border rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">GitHub URL</label>
                <input
                  type="url"
                  value={formData.github_url}
                  onChange={(e) => updateField("github_url", e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full px-3 py-2.5 bg-bg-elevated border border-border rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Portfolio URL</label>
                <input
                  type="url"
                  value={formData.portfolio_url}
                  onChange={(e) => updateField("portfolio_url", e.target.value)}
                  placeholder="https://yourportfolio.com"
                  className="w-full px-3 py-2.5 bg-bg-elevated border border-border rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary disabled:opacity-0 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Complete Setup
                  <Sparkles className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
