"use client";

import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import Link from "next/link";
import { use, useEffect, useState } from "react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

interface Repo {
  name: string;
  url: string;
}

export default function ResultsPage({
  params,
}: {
  params: Promise<{ file_key: string }>;
}) {
  const resolvedParams = use(params);
  const fileKey = resolvedParams.file_key;
  const { user, login } = useAuth();

  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  // GitHub state
  const [repos, setRepos] = useState<Repo[]>([]);
  const [repoName, setRepoName] = useState("");
  const [createNew, setCreateNew] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [pushing, setPushing] = useState(false);
  const [pushSuccess, setPushSuccess] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [pushError, setPushError] = useState("");

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true);

        const statusResponse = await api.get(`/api/status/${fileKey}`);
        const currentStatus = statusResponse.data.status;
        setStatus(currentStatus);

        if (currentStatus !== "completed") {
          setError(`Conversion not completed. Status: ${currentStatus}`);
          setLoading(false);
          return;
        }
        const previewResponse = await api.get(`/api/preview/${fileKey}`);
        setPreviewUrl(previewResponse.data.preview_url);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching preview:", err);
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.detail ||
              err.message ||
              "Failed to load preview"
          );
        } else {
          setError("An unexpected error occurred");
        }
        setLoading(false);
      }
    };

    fetchPreview();
  }, [fileKey]);

  // Fetch user repos when logged in
  useEffect(() => {
    if (user) {
      fetchRepos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchRepos = async () => {
    if (!user) return;
    try {
      const { data } = await api.get(`/api/github/repos?user_id=${user.id}`);
      setRepos(data);
    } catch (err) {
      console.error("Failed to fetch repos:", err);
    }
  };

  const handlePushToGitHub = async () => {
    if (!user) return;

    const finalRepoName = (createNew ? repoName : selectedRepo).trim();
    if (!finalRepoName) {
      setPushError("Please provide a repository name");
      return;
    }

    try {
      setPushing(true);
      setPushError("");

      const { data } = await api.post("/api/github/push-code", null, {
        params: {
          user_id: user.id,
          file_key: fileKey,
          repo_name: finalRepoName,
          create_new: createNew,
        },
      });

      setPushSuccess(true);
      setRepoUrl(data.repo_url);
    } catch (err) {
      console.error("Failed to push to GitHub:", err);
      if (axios.isAxiosError(err)) {
        setPushError(
          err.response?.data?.detail || "Failed to push code to GitHub"
        );
      } else {
        setPushError("An unexpected error occurred");
      }
    } finally {
      setPushing(false);
    }
  };

  const getViewportWidth = (): string => {
    switch (viewMode) {
      case "mobile":
        return "max-w-[375px]";
      case "tablet":
        return "max-w-[768px]";
      default:
        return "w-full";
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-lg text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    );
  }
  if (error && !previewUrl) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Failed to Load Preview</h2>
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground">File Key: {fileKey}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link href="/convert">
              <Button>Try Again</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Go Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <h1 className="text-xl font-bold gradient-text">
                  Vision2React
                </h1>
              </Link>
              <Badge variant="success">Completed</Badge>
            </div>

            <div className="flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  {user.username}
                </div>
              )}
              <Link href="/convert">
                <Button variant="outline" size="sm">
                  New Conversion
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Preview Panel */}
        <div className="flex-1 flex flex-col bg-muted/30">
          {/* Viewport Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/30">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("desktop")}
                className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                  viewMode === "desktop"
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                Desktop
              </button>
              <button
                onClick={() => setViewMode("tablet")}
                className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                  viewMode === "tablet"
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                Tablet
              </button>
              <button
                onClick={() => setViewMode("mobile")}
                className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                  viewMode === "mobile"
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                Mobile
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground font-mono">
                {fileKey}
              </div>
              {previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Open in New Tab
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Preview Iframe */}
          <div className="flex-1 p-6 overflow-auto flex justify-center">
            <div
              className={`${getViewportWidth()} transition-all duration-300`}
            >
              <div
                className="bg-white rounded-lg shadow-2xl overflow-hidden border border-border"
                style={{ aspectRatio: viewMode === "mobile" ? "9/16" : "auto" }}
              >
                {previewUrl ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-full min-h-[600px]"
                    title="Preview"
                  />
                ) : (
                  <div className="flex items-center justify-center h-[600px] bg-muted">
                    <div className="text-center space-y-2">
                      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-sm text-muted-foreground">
                        Loading preview...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* GitHub Panel */}
        <div className="w-[420px] flex flex-col border-l border-border bg-card">
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Push to GitHub
              </h2>
              <p className="text-sm text-muted-foreground">
                Deploy your generated code to a GitHub repository
              </p>
            </div>

            {!user ? (
              <Card className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    Sign in with GitHub to push your code
                  </p>
                </div>
                <Button onClick={login} className="w-full">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Sign in with GitHub
                </Button>
              </Card>
            ) : pushSuccess ? (
              <Card className="p-6 text-center space-y-4 border-accent">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-6 h-6 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold">Successfully Pushed!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your code has been pushed to GitHub
                  </p>
                </div>
                <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full">
                    View on GitHub
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </Button>
                </a>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPushSuccess(false);
                    setRepoName("");
                  }}
                  className="w-full"
                >
                  Push to Another Repo
                </Button>
              </Card>
            ) : (
              <Card className="p-6 space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCreateNew(true)}
                    className={`flex-1 px-3 py-2 rounded text-sm font-medium transition ${
                      createNew
                        ? "bg-primary text-white"
                        : "bg-muted text-foreground hover:bg-muted/70"
                    }`}
                  >
                    Create New
                  </button>
                  <button
                    onClick={() => setCreateNew(false)}
                    className={`flex-1 px-3 py-2 rounded text-sm font-medium transition ${
                      !createNew
                        ? "bg-primary text-white"
                        : "bg-muted text-foreground hover:bg-muted/70"
                    }`}
                  >
                    Use Existing
                  </button>
                </div>

                {createNew ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Repository Name
                    </label>
                    <Input
                      placeholder="my-vision2react-app"
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      A new private repository will be created
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Select Repository
                    </label>
                    <select
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                      value={selectedRepo}
                      onChange={(e) => setSelectedRepo(e.target.value)}
                    >
                      <option value="">Select a repository...</option>
                      {repos.map((repo) => (
                        <option key={repo.name} value={repo.name}>
                          {repo.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Code will be pushed to the selected repository
                    </p>
                  </div>
                )}

                {pushError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-500">
                    {pushError}
                  </div>
                )}

                <Button
                  onClick={handlePushToGitHub}
                  disabled={pushing || (createNew ? !repoName : !selectedRepo)}
                  className="w-full"
                >
                  {pushing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Pushing...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      Push to GitHub
                    </>
                  )}
                </Button>
              </Card>
            )}

            <div className="pt-4 border-t border-border space-y-3">
              <h3 className="font-medium text-sm">What happens next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 mt-0.5 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Code is cloned from E2B sandbox
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 mt-0.5 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Pushed to your GitHub repository
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 mt-0.5 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Ready to deploy on Vercel or Netlify
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
