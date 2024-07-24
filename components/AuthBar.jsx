"use client";
import { SignInButton } from "@/components/SignInButton";
import { SignOutButton } from "@/components/SignOutButton";
import { SessionProvider } from "next-auth/react";
import StripeSubscription from "./StripeSubscription";

export default function AuthBar() {
  return (
    <>
      <div className="flex flex-row w-full text-white justify-between items-center">
        <SessionProvider>
          <h1 className="text-xl">Earl LLM</h1>
          <div className="flex flex-row space-x-4 items-center">
            <StripeSubscription />
            <SignInButton />
            <SignOutButton />
          </div>
        </SessionProvider>
      </div>
      <hr className="text-white my-2" />
    </>
  );
}
