"use client";

import { useRef, useState } from "react";
import { ChevronsLeft, PlusCircle, Search, Settings, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Sidebar() {
  const sidebarRef = useRef<HTMLElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(260);

  const handleMouseDown = () => {
    setIsResizing(true);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const newWidth = Math.max(200, Math.min(480, e.clientX));
    setSidebarWidth(newWidth);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "group/sidebar relative flex h-full flex-col overflow-y-auto bg-sidebar",
          isCollapsed && "w-0 overflow-hidden"
        )}
        style={{ width: isCollapsed ? 0 : sidebarWidth }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📝</span>
            <span className="text-sm font-semibold">Workspace</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover/sidebar:opacity-100"
            onClick={() => setIsCollapsed(true)}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="space-y-1 px-2">
          <Button variant="ghost" className="h-8 w-full justify-start gap-2 px-2 text-sm">
            <Search className="h-4 w-4" /> Search
          </Button>
          <Button variant="ghost" className="h-8 w-full justify-start gap-2 px-2 text-sm">
            <Settings className="h-4 w-4" /> Settings
          </Button>
          <Button variant="ghost" className="h-8 w-full justify-start gap-2 px-2 text-sm">
            <PlusCircle className="h-4 w-4" /> New page
          </Button>
        </div>

        {/* Document tree placeholder */}
        <div className="flex-1 px-2 py-4">
          <p className="px-2 text-xs text-muted-foreground">No pages yet</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t p-2">
          <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs text-muted-foreground">
            <Trash2 className="h-3.5 w-3.5" /> Trash
          </Button>
          <ThemeToggle />
        </div>

        {/* Resize handle */}
        <div
          className="absolute right-0 top-0 h-full w-1 cursor-col-resize opacity-0 transition hover:opacity-100 group-hover/sidebar:opacity-100"
          onMouseDown={handleMouseDown}
          style={{ background: isResizing ? "hsl(var(--primary))" : "hsl(var(--border))" }}
        />
      </aside>

      {/* Collapsed toggle */}
      {isCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-2 z-50 h-8 w-8"
          onClick={() => setIsCollapsed(false)}
        >
          <ChevronsLeft className="h-4 w-4 rotate-180" />
        </Button>
      )}
    </>
  );
}
