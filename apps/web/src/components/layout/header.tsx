"use client";

import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  UserCircle,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-bg-base/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="ml-12 lg:ml-0">
          <h1 className="text-lg font-display font-semibold">{title}</h1>
          {description && (
            <p className="text-sm text-text-secondary">{description}</p>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-bg-elevated transition-colors"
          >
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={28}
                height={28}
                className="rounded-full"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-brand-primary/20 flex items-center justify-center">
                <UserCircle className="h-4 w-4 text-brand-primary" />
              </div>
            )}
            <ChevronDown className="h-3.5 w-3.5 text-text-secondary" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-bg-card border border-border rounded-lg shadow-xl py-1 animate-fade-in">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-sm font-medium truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-text-secondary truncate">
                  {session?.user?.email}
                </p>
              </div>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors w-full"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
