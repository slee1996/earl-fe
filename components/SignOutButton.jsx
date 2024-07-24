"use client";
import React, { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export const SignOutButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const result = await signOut({
        callbackUrl: "/", // Redirect to home page after sign out
        redirect: true,
      });
      if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      console.error("Sign out error:", error);
      // Handle sign-out error, e.g., show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
    >
      {isLoading ? "Signing Out..." : "Sign Out"}
    </button>
  );
};
