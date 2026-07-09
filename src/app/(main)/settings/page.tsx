"use client";

import { UserProfile, useUser, useClerk } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { LogOut, Moon, Sun, Monitor } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Theme Section */}
      <section className="space-y-4 rounded-lg border p-6">
        <div>
          <h2 className="text-lg font-semibold">Appearance</h2>
          <p className="text-sm text-muted-foreground">
            Customize how the app looks on your device.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("light")}
            className="gap-2"
          >
            <Sun className="h-4 w-4" />
            Light
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("dark")}
            className="gap-2"
          >
            <Moon className="h-4 w-4" />
            Dark
          </Button>
          <Button
            variant={theme === "system" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("system")}
            className="gap-2"
          >
            <Monitor className="h-4 w-4" />
            System
          </Button>
        </div>
      </section>

      {/* Account Section */}
      <section className="space-y-4 rounded-lg border p-6">
        <div>
          <h2 className="text-lg font-semibold">Account</h2>
          <p className="text-sm text-muted-foreground">
            Manage your profile, email, and security settings.
          </p>
        </div>

        {/* Inline user info */}
        <div className="flex items-center gap-4 rounded-md border p-4">
          <img
            src={user?.imageUrl}
            alt={user?.fullName || "Avatar"}
            className="h-12 w-12 rounded-full"
          />
          <div className="flex-1">
            <p className="font-medium">{user?.fullName || "User"}</p>
            <p className="text-sm text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/settings/profile")}>
            Edit profile
          </Button>
        </div>
      </section>

      {/* Session Section */}
      <section className="space-y-4 rounded-lg border p-6">
        <div>
          <h2 className="text-lg font-semibold">Sessions</h2>
          <p className="text-sm text-muted-foreground">
            Manage your active sessions across devices.
          </p>
        </div>
        <div className="flex items-center justify-between rounded-md border p-4">
          <div>
            <p className="text-sm font-medium">Current session</p>
            <p className="text-xs text-muted-foreground">
              Signed in as {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
          <Button variant="destructive" size="sm" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-4 rounded-lg border border-destructive/50 p-6">
        <div>
          <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
          <p className="text-sm text-muted-foreground">
            Irreversible and destructive actions.
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => router.push("/settings/profile")}
        >
          Delete account
        </Button>
      </section>
    </div>
  );
}
