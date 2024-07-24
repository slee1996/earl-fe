"use client";
import React, { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export const SignInButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signIn("google", {
        callbackUrl: "/", // Redirect to home page after sign in
        redirect: false,
      });
      if (result?.error) {
        console.error("Sign in error:", result.error);
        // Handle sign-in error, e.g., show error message to user
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      // Handle sign-in error, e.g., show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "authenticated") {
    return <div>Signed in as {session.user.email}</div>;
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
    >
      {isLoading ? "Signing In..." : "Sign In with Google"}
    </button>
  );
};
