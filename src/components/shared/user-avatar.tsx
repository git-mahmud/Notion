"use client";

import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

export function UserAvatar({ className, size = "md" }: UserAvatarProps) {
  const { user } = useUser();

  if (!user) return null;

  return (
    <img
      src={user.imageUrl}
      alt={user.fullName || "User"}
      className={cn("rounded-full object-cover", sizeClasses[size], className)}
    />
  );
}
