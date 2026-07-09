"use client";

import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DocumentsPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4">
      <div className="text-6xl">📝</div>
      <h2 className="text-xl font-medium">Welcome to your workspace</h2>
      <p className="text-sm text-muted-foreground">Create a page to get started</p>
      <Button>
        <PlusCircle className="mr-2 h-4 w-4" />
        Create a page
      </Button>
    </div>
  );
}
