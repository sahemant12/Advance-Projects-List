"use client";

import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ProcessingStage =
  | "idle"
  | "validating"
  | "fetching"
  | "processing"
  | "generating"
  | "cooking"
  | "completed"
  | "error";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export default function ConvertPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [figmaUrl, setFigmaUrl] = useState("");
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    // Redirect to token setup if not authenticated or no token
    if (!user) {
      localStorage.setItem("oauth_return_url", "/convert");
      router.push("/");
      return;
    }

    // Check if user has Figma token
    const checkToken = async () => {
      try {
        const { data } = await api.get(
          `/auth/github/check-figma-token/${user.id}`
        );
        if (!data.has_figma_token) {
          router.push("/setup-token");
        }
      } catch (err) {
        console.error("Error checking token:", err);
        router.push("/setup-token");
      }
    };
    checkToken();
  }, [user, router]);

  const validateUrl = (url: string): boolean => {
    return url.includes("figma.com/file/") || url.includes("figma.com/design/");
  };

  const pollStatus = async (fileKey: string) => {
    let attempts = 0;
    const maxAttempts = 120;

    const poll = async () => {
      try {
        const { data } = await api.get(`/api/status/${fileKey}`);
        const status = data.status;
        console.log(`Status: ${status}`);

        if (status === "queued") {
          setStage("validating");
        } else if (status === "processing") {
          setStage("cooking");
        } else if (status === "completed") {
          setStage("generating");

          try {
            const previewResponse = await api.get(`/api/preview/${fileKey}`);
            console.log("Preview URL: ", previewResponse.data.preview_url);
            setStage("completed");
            setTimeout(() => {
              router.push(`/results/${fileKey}`);
            }, 1500);
            return;
          } catch (previewError) {
            if (axios.isAxiosError(previewError)) {
              if (previewError.response?.status === 202) {
                console.log("Preview not ready yet, continuing to poll...");
              } else {
                throw new Error(
                  previewError.response?.data?.detail ||
                    "Failed to get preview",
                );
              }
            } else {
              throw previewError;
            }
          }
        } else if (status.startsWith("failed:")) {
          const errorMsg = status.replace("failed:", "").replace(/_/g, " ");
          throw new Error(`Processing failed: ${errorMsg}`);
        }
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000);
        } else {
          throw new Error("Timeout: Processing took too long");
        }
      } catch (pollError) {
        console.error("Polling error:", pollError);
        if (axios.isAxiosError(pollError)) {
          const errorMsg =
            pollError.response?.data?.detail ||
            pollError.message ||
            "Processing failed";
          setError(errorMsg);
        } else if (pollError instanceof Error) {
          setError(pollError.message);
        } else {
          setError("An unexpected error occurred");
        }
        setStage("error");
      }
    };
    await poll();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateUrl(figmaUrl)) {
      setError("Please enter a valid Figma file URL");
      return;
    }

    if (!user) {
      setError("User not authenticated");
      return;
    }

    setStage("validating");

    try {
      // Backend handles extraction and validation
      const { data } = await api.post("/api/figma", {
        figma_url: figmaUrl,
        user_id: user.id,
      });
      console.log("Queued for processing:", data);
      const fileKey = data.file_key;

      setStage("fetching");
      await pollStatus(fileKey);
    } catch (err) {
      console.error("Submission error:", err);
      if (axios.isAxiosError(err)) {
        const errorMsg =
          err.response?.data?.detail ||
          err.message ||
          "Failed to process design";
        setError(errorMsg);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to process design. Please try again");
      }
      setStage("error");
    }
  };

  const getStageMessage = (): string => {
    switch (stage) {
      case "validating":
        return "Validating Figma URL...";
      case "fetching":
        return "Fetching design from Figma...";
      case "cooking":
        return "AI is cooking your components...";
      case "generating":
        return "Generating final code...";
      case "completed":
        return "Conversion complete! Redirecting...";
      default:
        return "";
    }
  };

  const isProcessing = [
    "validating",
    "fetching",
    "cooking",
    "generating",
  ].includes(stage);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            Convert <span className="gradient-text">Figma to React</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Paste your Figma design URL and let AI do the heavy lifting
          </p>
        </div>

        {/* Form */}
        <Card className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="figma-url" className="text-sm font-medium">
                Figma URL
              </label>
              <Input
                id="figma-url"
                type="url"
                placeholder="https://www.figma.com/file/..."
                value={figmaUrl}
                onChange={(e) => setFigmaUrl(e.target.value)}
                disabled={isProcessing}
                error={!!error}
                className="font-mono text-sm"
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isProcessing || !figmaUrl}
            >
              {isProcessing ? "Processing..." : "Convert to React"}
            </Button>
          </form>

          {/* Processing Status */}
          {stage !== "idle" && stage !== "error" && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{getStageMessage()}</span>
                {stage === "completed" && (
                  <Badge variant="success" pulse>
                    Complete
                  </Badge>
                )}
              </div>

              {/* Simple loading indicator */}
              {stage !== "completed" && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Help text */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Need a Figma URL? Open your design in Figma and copy the URL from
            your browser&apos;s address bar
          </p>
        </div>
      </div>
    </div>
  );
}
