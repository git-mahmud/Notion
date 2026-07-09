"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = { sm: 24, md: 32, lg: 40 };
const sizeClasses = { sm: "h-6 w-6", md: "h-8 w-8", lg: "h-10 w-10" };

export function UserAvatar({ className, size = "md" }: UserAvatarProps) {
  const { user } = useUser();

  if (!user?.imageUrl) return null;

  return (
    <Image
      src={user.imageUrl}
      alt={user.fullName || "User"}
      width={sizeMap[size]}
      height={sizeMap[size]}
      className={cn("rounded-full object-cover", sizeClasses[size], className)}
    />
  );
}
