"use client";

import { useUser } from "@clerk/nextjs";

export function useCurrentUser() {
  const { user, isLoaded, isSignedIn } = useUser();

  return {
    user,
    isLoaded,
    isSignedIn,
    fullName: user?.fullName || "User",
    email: user?.primaryEmailAddress?.emailAddress || "",
    imageUrl: user?.imageUrl || "",
    userId: user?.id || null,
  };
}
