"use client";

import { UserProfile } from "@clerk/nextjs";
import type { Metadata } from "next";

export default function ProfilePage() {
  return (
    <div className="flex h-full items-center justify-center py-10">
      <UserProfile
        appearance={{
          elements: {
            rootBox: "w-full max-w-3xl",
            card: "shadow-none border",
            navbar: "hidden",
            pageScrollBox: "p-0",
            formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
          },
        }}
      />
    </div>
  );
}
