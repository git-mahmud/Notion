"use client";

import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentPage() {
  const params = useParams();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Document content will be rendered here */}
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
      </div>
    </div>
  );
}
