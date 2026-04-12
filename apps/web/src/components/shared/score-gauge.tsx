"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#10b981"; // success
  if (score >= 60) return "#f59e0b"; // warning
  return "#ef4444"; // danger
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Work";
}

export function ScoreGauge({
  score,
  size = 120,
  strokeWidth = 8,
  className,
  label,
}: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;
  const color = getScoreColor(score);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-bg-elevated"
        />
        {/* Score circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-2xl font-display font-bold"
          style={{ color }}
        >
          {Math.round(animatedScore)}
        </span>
        <span className="text-xs text-text-secondary">
          {label || getScoreLabel(score)}
        </span>
      </div>
    </div>
  );
}
