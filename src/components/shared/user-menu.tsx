"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User } from "lucide-react";

import { UserAvatar } from "@/components/shared/user-avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm hover:bg-accent">
          <UserAvatar size="sm" />
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium">{user.fullName || "User"}</p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start" side="top" sideOffset={8}>
        <DropdownMenuLabel>
          <div className="flex items-center gap-2">
            <UserAvatar size="md" />
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium">{user.fullName || "User"}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/settings/profile")}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ redirectUrl: "/sign-in" })}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
