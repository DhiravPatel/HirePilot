import Link from "next/link";
import {
  FileSearch,
  Mail,
  Briefcase,
  Key,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "ATS Resume Scanner",
    description:
      "Get instant ATS compatibility scores and actionable suggestions to optimize your resume for any job.",
  },
  {
    icon: Mail,
    title: "Cold Email Generator",
    description:
      "Generate personalized cold emails with AI that match your tone and style. Follow-ups included.",
  },
  {
    icon: Briefcase,
    title: "Job Application Tracker",
    description:
      "Track every application from saved to offer. Drag-and-drop Kanban board keeps you organized.",
  },
  {
    icon: Key,
    title: "Keyword Optimizer",
    description:
      "Discover missing keywords and optimize your resume to pass automated screening systems.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-base">
      {/* Nav */}
      <nav className="border-b border-border bg-bg-base/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-brand-primary" />
            <span className="text-xl font-display font-bold gradient-text">
              HirePilot
            </span>
          </div>
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg font-medium transition-colors text-sm"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4" />
              AI-Powered Job Application Platform
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight mb-6">
              Land Your Dream Job{" "}
              <span className="gradient-text">Faster</span>
            </h1>
            <p className="text-lg text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
              Optimize your resume for ATS systems, generate personalized cold
              emails, track applications, and leverage AI to stand out from the
              competition.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/signin"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg font-semibold transition-colors"
              >
                Start For Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-display font-bold mb-4">
            Everything You Need to Get Hired
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Powerful AI tools designed to give you an unfair advantage in your
            job search.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl bg-bg-card border border-border hover:border-brand-primary/40 transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-lg bg-brand-primary/10 flex items-center justify-center mb-4 group-hover:bg-brand-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-brand-primary" />
              </div>
              <h3 className="text-lg font-display font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-primary" />
            <span className="text-sm font-display font-semibold gradient-text">
              HirePilot
            </span>
          </div>
          <p className="text-sm text-text-secondary">
            &copy; {new Date().getFullYear()} HirePilot. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
