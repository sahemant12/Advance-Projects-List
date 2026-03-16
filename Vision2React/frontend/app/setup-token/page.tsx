"use client";

import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export default function SetupTokenPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [figmaToken, setFigmaToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      localStorage.setItem("oauth_return_url", "/setup-token");
      router.push("/");
      return;
    }

    // Check if user already has a token
    const checkExistingToken = async () => {
      try {
        const { data } = await api.get(
          `/auth/github/check-figma-token/${user.id}`
        );
        if (data.has_figma_token) {
          router.push("/convert");
        }
      } catch (err) {
        console.error("Error checking token:", err);
      }
    };
    checkExistingToken();
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!figmaToken.trim()) {
      setError("Please enter your Figma access token");
      return;
    }

    if (!user) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/github/save-figma-token", {
        user_id: user.id,
        figma_token: figmaToken.trim(),
      });

      // Redirect to convert page
      router.push("/convert");
    } catch (err) {
      console.error("Error saving token:", err);
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail ||
            "Failed to save token. Please try again."
        );
      } else {
        setError("Failed to save token. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="info" className="mb-2">
            Step 1 of 2
          </Badge>
          <h1 className="text-4xl font-bold">
            Connect Your <span className="gradient-text">Figma Account</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            We need your Figma access token to fetch your designs
          </p>
        </div>

        {/* Form */}
        <Card className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <label htmlFor="figma-token" className="text-sm font-medium block">
                Figma Access Token
              </label>
              <Input
                id="figma-token"
                type="password"
                placeholder="figd_xxxxxxxxxxxxxxxxxxxxx"
                value={figmaToken}
                onChange={(e) => setFigmaToken(e.target.value)}
                disabled={loading}
                error={!!error}
                className="font-mono text-sm"
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading || !figmaToken.trim()}
            >
              {loading ? "Saving..." : "Continue to Convert →"}
            </Button>
          </form>

          {/* Help Section */}
          <div className="pt-6 border-t border-border space-y-4">
            <h3 className="text-sm font-semibold">How to get your Figma token:</h3>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>
                Go to{" "}
                <a
                  href="https://www.figma.com/developers/api#access-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Figma Settings → Personal Access Tokens
                </a>
              </li>
              <li>Click "Generate new token"</li>
              <li>Give it a name (e.g., "Vision2React")</li>
              <li>Copy the token and paste it above</li>
            </ol>
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-sm text-accent flex items-start gap-2">
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  Your token is stored securely and only used to fetch your
                  Figma designs. We never share or expose your token.
                </span>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
