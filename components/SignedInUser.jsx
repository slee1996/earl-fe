"use client";
import { useSession } from "next-auth/react";

export const SignedInUser = () => {
  const { data: session, status } = useSession();

  return session ? <div className="text-white">{session.user.name}</div> : null;
};
