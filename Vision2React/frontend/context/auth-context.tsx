"use client";

import { useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useState } from "react";

interface User {
  id: number;
  username: string;
  name: string | null;
  email: string | null;
}

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize user state directly from localStorage
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const storedUser = localStorage.getItem("github_user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem("github_user");
      }
    }
    return null;
  });
  const router = useRouter();

  const login = () => {
    // Save current URL to return to it later if needed
    localStorage.setItem("oauth_return_url", window.location.pathname);
    // Redirect to backend auth endpoint
    window.location.href = `${
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    }/auth/github/login`;
  };

  const logout = () => {
    localStorage.removeItem("github_user");
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
