"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

const LoadingState = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
      <p className="text-lg text-muted-foreground">Completing sign in...</p>
    </div>
  </div>
);

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const userId = searchParams.get("user_id");
      const username = searchParams.get("username");
      const name = searchParams.get("name");
      const email = searchParams.get("email");

      if (userId && username) {
        const user = {
          id: parseInt(userId),
          username,
          name,
          email,
        };

        localStorage.setItem("github_user", JSON.stringify(user));
        setUser(user);

        const returnUrl = localStorage.getItem("oauth_return_url") || "/";
        localStorage.removeItem("oauth_return_url");
        router.push(returnUrl);
      } else {
        router.push("/");
      }
    };
    handleCallback();
  }, [router, searchParams, setUser]);

  return <LoadingState />;
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
