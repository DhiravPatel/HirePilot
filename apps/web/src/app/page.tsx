"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Zap,
  Shield,
  TrendingUp,
  ChevronRight,
  Star,
  BarChart3,
  Target,
  MousePointerClick,
} from "lucide-react";

// ── Animated counter hook ────────────────────────────────────────────────
function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ── Intersection observer hook ───────────────────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ── Data ─────────────────────────────────────────────────────────────────
const features = [
  {
    icon: Mail,
    title: "Cold Email Generator",
    description: "AI-crafted personalized cold emails that match your voice. Complete with follow-up sequences.",
    color: "from-cyan-500 to-blue-500",
    bg: "bg-cyan-500/10",
    border: "group-hover:border-cyan-500/40",
  },
  {
    icon: FileText,
    title: "Resume Manager",
    description: "Upload and manage your resumes in the cloud. Always have them ready when opportunity knocks.",
    color: "from-indigo-500 to-violet-500",
    bg: "bg-indigo-500/10",
    border: "group-hover:border-indigo-500/40",
  },
];

const steps = [
  { icon: MousePointerClick, title: "Sign in with Google", description: "One click to get started. No forms, no friction." },
  { icon: Target, title: "Set your target role", description: "Tell us what you're aiming for so AI can personalize everything." },
  { icon: Zap, title: "Let AI do the heavy lifting", description: "Scan resumes, generate emails, optimize keywords — all in seconds." },
];

const stats = [
  { label: "Emails Generated", value: 12000, suffix: "+" },
  { label: "Resumes Uploaded", value: 8500, suffix: "+" },
  { label: "Users Hired", value: 2400, suffix: "+" },
  { label: "Job Seekers", value: 3200, suffix: "+" },
];

// ── Floating particles background ────────────────────────────────────────
function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-brand-primary/20"
          style={{
            width: `${Math.random() * 4 + 1}px`,
            height: `${Math.random() * 4 + 1}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Animated grid background ─────────────────────────────────────────────
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(var(--brand-primary) 1px, transparent 1px), linear-gradient(90deg, var(--brand-primary) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const heroRef = useInView(0.1);
  const featuresRef = useInView(0.15);
  const stepsRef = useInView(0.15);
  const statsRef = useInView(0.3);
  const ctaRef = useInView(0.2);


  return (
    <div className="min-h-screen bg-bg-base text-text-primary overflow-x-hidden">
      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-bg-base/60 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-display font-bold tracking-tight">
              Hire<span className="gradient-text">Pilot</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signin"
              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary hover:shadow-lg hover:shadow-brand-primary/25 text-white rounded-lg font-medium transition-all duration-300 text-sm"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section ref={heroRef.ref} className="relative pt-32 pb-24 md:pt-40 md:pb-32">
        <GridBackground />
        <ParticleField />

        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-brand-secondary/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-brand-accent/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-primary/20 bg-brand-primary/5 text-brand-primary text-sm font-medium mb-8 transition-all duration-700 ${
                heroRef.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
              AI-Powered Job Application Platform
            </div>

            {/* Heading */}
            <h1
              className={`text-5xl sm:text-6xl md:text-7xl font-display font-bold tracking-tight leading-[1.1] mb-8 transition-all duration-700 delay-100 ${
                heroRef.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              Land Your Dream Job
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent">
                10x Faster
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className={`text-lg md:text-xl text-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${
                heroRef.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              Generate personalized cold emails, manage your resumes,
              and land your next opportunity — all powered by AI.
            </p>

            {/* CTA */}
            <div
              className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-300 ${
                heroRef.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <Link
                href="/signin"
                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-brand-primary/30 hover:scale-[1.02]"
              >
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                <span className="relative flex items-center gap-2">
                  Start For Free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <CheckCircle2 className="h-4 w-4 text-success" />
                No credit card required
              </div>
            </div>

            {/* Trust indicators */}
            <div
              className={`flex items-center justify-center gap-6 mt-12 transition-all duration-700 delay-[400ms] ${
                heroRef.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-2 text-sm text-text-secondary">4.9/5 rating</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <span className="text-sm text-text-secondary">2,400+ job seekers</span>
            </div>
          </div>

          {/* Hero visual — floating dashboard mockup */}
          <div
            className={`mt-20 relative transition-all duration-1000 delay-500 ${
              heroRef.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <div className="relative mx-auto max-w-5xl">
              {/* Glow behind */}
              <div className="absolute -inset-4 bg-gradient-to-r from-brand-primary/20 via-brand-secondary/20 to-brand-accent/20 rounded-2xl blur-2xl opacity-50" />

              {/* Dashboard preview card */}
              <div className="relative rounded-2xl border border-white/10 bg-bg-card/80 backdrop-blur-xl overflow-hidden shadow-2xl">
                {/* Title bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500/70" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                    <div className="h-3 w-3 rounded-full bg-green-500/70" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-6 py-1 rounded-md bg-white/5 text-xs text-text-secondary">
                      hirepilot.app/dashboard
                    </div>
                  </div>
                </div>

                {/* Mock content */}
                <div className="p-6 md:p-8 grid grid-cols-4 gap-4">
                  {/* Stat cards */}
                  {[
                    { label: "Resumes", value: "3", color: "text-success" },
                    { label: "Emails Sent", value: "24", color: "text-brand-accent" },
                    { label: "This Week", value: "8", color: "text-brand-primary" },
                    { label: "Follow-ups", value: "5", color: "text-amber-400" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
                      <p className="text-xs text-text-secondary mb-1">{s.label}</p>
                      <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
                    </div>
                  ))}

                  {/* Activity placeholder */}
                  <div className="col-span-4 rounded-xl bg-white/[0.03] border border-white/5 p-4 h-40">
                    <p className="text-xs text-text-secondary mb-3">Recent Activity</p>
                    <div className="space-y-2.5">
                      {[
                        { text: "Cold Email: Google — SWE III", score: "Sent", color: "text-brand-accent" },
                        { text: "Resume uploaded: resume_v3.pdf", score: "Default", color: "text-success" },
                        { text: "Cold Email: Stripe — Frontend", score: "Sent", color: "text-brand-primary" },
                        { text: "Cold Email: Meta — Product Eng", score: "Sent", color: "text-amber-400" },
                      ].map((a, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-text-secondary truncate">{a.text}</span>
                          <span className={`font-medium ${a.color}`}>{a.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <section ref={statsRef.ref} className="relative py-20 border-y border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 via-transparent to-brand-secondary/5" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const count = useCounter(stat.value, 2000, statsRef.inView);
              return (
                <div
                  key={stat.label}
                  className={`text-center transition-all duration-700 ${
                    statsRef.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <p className="text-4xl md:text-5xl font-display font-bold gradient-text">
                    {count.toLocaleString()}{stat.suffix}
                  </p>
                  <p className="text-sm text-text-secondary mt-2">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section ref={featuresRef.ref} className="relative py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              featuresRef.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-medium mb-4">
              <Zap className="h-3 w-3" /> FEATURES
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-4">
              Your AI-Powered Career
              <br />
              <span className="gradient-text">Command Center</span>
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto text-lg">
              Every tool you need to dominate your job search, in one platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`group relative p-7 rounded-2xl bg-bg-card border border-border ${feature.border} transition-all duration-500 hover:bg-bg-elevated hover:shadow-2xl hover:shadow-brand-primary/5 hover:-translate-y-1 ${
                  featuresRef.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100 + 150}ms` }}
              >
                {/* Gradient line at top */}
                <div className={`absolute top-0 left-8 right-8 h-px bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className={`h-12 w-12 rounded-xl ${feature.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6 text-text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-5 flex items-center gap-1 text-sm text-brand-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Learn more <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────── */}
      <section ref={stepsRef.ref} className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/[0.02] to-transparent" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              stepsRef.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium mb-4">
              <BarChart3 className="h-3 w-3" /> HOW IT WORKS
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-4">
              Three Steps to Your
              <br />
              <span className="gradient-text">Next Offer</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-border via-brand-primary/30 to-border" />

            {steps.map((step, i) => (
              <div
                key={step.title}
                className={`relative text-center transition-all duration-700 ${
                  stepsRef.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${i * 150 + 150}ms` }}
              >
                {/* Step number */}
                <div className="relative mx-auto mb-6">
                  <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg shadow-brand-primary/20">
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-bg-base border-2 border-brand-primary flex items-center justify-center text-xs font-bold text-brand-primary">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-lg font-display font-semibold mb-2">
                  {step.title}
                </h3>
                <p className="text-text-secondary text-sm max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section ref={ctaRef.ref} className="relative py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div
            className={`relative overflow-hidden rounded-3xl border border-white/10 transition-all duration-700 ${
              ctaRef.inView ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-bg-card to-brand-secondary/20" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-secondary/10 rounded-full blur-[100px]" />

            <div className="relative px-8 py-16 md:px-16 md:py-24 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-6">
                <Shield className="h-4 w-4 text-success" />
                100% Free — No Credit Card Required
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-6">
                Ready to Land Your
                <br />
                <span className="gradient-text">Dream Job?</span>
              </h2>
              <p className="text-text-secondary text-lg max-w-xl mx-auto mb-10">
                Join thousands of job seekers using AI to get more interviews,
                write better outreach, and track their progress.
              </p>
              <Link
                href="/signin"
                className="group relative inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-brand-primary/30 hover:scale-[1.02]"
              >
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                <span className="relative flex items-center gap-2">
                  Get Started Now
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <div className="flex items-center justify-center gap-6 mt-8 text-sm text-text-secondary">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success" /> Free forever
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success" /> Google sign-in
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success" /> AI-powered
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-display font-bold">
              Hire<span className="gradient-text">Pilot</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-text-secondary">
            <TrendingUp className="h-4 w-4 text-brand-primary" />
            <span>Built for job seekers, powered by AI</span>
          </div>
          <p className="text-sm text-text-secondary">
            &copy; {new Date().getFullYear()} HirePilot
          </p>
        </div>
      </footer>
    </div>
  );
}
