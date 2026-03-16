"use client";

import Button from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

export function Navbar() {
  const { user, login, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-border/50 shadow-sm"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-xl blur-md opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="relative w-full h-full bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-300">
              <svg
                className="w-5 h-5 text-white drop-shadow-md"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Vision2React
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {!mounted ? (
            // Placeholder to prevent layout shift during hydration
            <div className="flex items-center gap-4">
              <div className="w-32 h-9 bg-white/5 rounded animate-pulse" />
            </div>
          ) : user ? (
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-muted-foreground hover:bg-white/10 transition-colors">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="font-medium">{user.username}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-muted-foreground hover:text-foreground hover:bg-white/5"
              >
                Logout
              </Button>
              <Link href="/convert">
                <Button
                  size="sm"
                  className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                >
                  New Project
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <Button
                size="sm"
                onClick={login}
                className="bg-white text-black cursor-pointer hover:bg-gray-200 shadow-lg shadow-white/10 transition-all font-semibold"
              >
                Sign In with GitHub
              </Button>
              <Link href="/convert">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={login}
                  className="text-muted-foreground cursor-pointer hover:text-foreground hover:bg-white/5"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
