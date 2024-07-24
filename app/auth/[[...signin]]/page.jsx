"use client";
import { SignInButton } from "@/components/SignInButton";
import { SignOutButton } from "@/components/SignOutButton";
import StripeSubscription from "@/components/StripeSubscription";
import { SessionProvider } from "next-auth/react";

export default function SignIn() {
  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center">
      <h1 className="text-white m-10 text-3xl">Janus AI</h1>
      <SessionProvider>
        <StripeSubscription />
        <SignInButton />
        <SignOutButton />
      </SessionProvider>
    </div>
  );
}
