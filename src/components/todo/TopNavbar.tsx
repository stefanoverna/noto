import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Share2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TopNavbarProps {
  title: string;
  onTitleChange: (title: string) => void;
  onShareClick: () => void;
  onAddGroup: () => void;
  status: "connected" | "connecting";
  completedCount: number;
  totalCount: number;
}

export function TopNavbar({
  title,
  onTitleChange,
  onShareClick,
  onAddGroup,
  status,
  completedCount,
  totalCount,
}: TopNavbarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);

  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleSave = () => {
    if (editValue.trim()) {
      onTitleChange(editValue.trim());
    } else {
      setEditValue(title);
    }
    setIsEditing(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b">
      {/* Progress bar */}
      <div className="h-2 bg-muted w-full">
        <div
          className="h-full bg-success transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 gap-3">
          {/* Left side: Back + Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  className="shrink-0 -ml-2"
                  size="icon"
                  variant="ghost"
                >
                  <Link to="/">
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Back to home</TooltipContent>
            </Tooltip>

            {isEditing ? (
              <input
                autoFocus
                className="flex-1 min-w-0 text-lg font-semibold bg-transparent border-b-2 border-primary outline-none"
                type="text"
                value={editValue}
                onBlur={handleSave}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") {
                    setEditValue(title);
                    setIsEditing(false);
                  }
                }}
              />
            ) : (
              <button
                className="flex-1 min-w-0 text-lg font-semibold text-left truncate hover:text-primary transition-colors"
                onClick={() => setIsEditing(true)}
              >
                {title}
              </button>
            )}
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center gap-1">
            {/* Connection status dot */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-2 cursor-default">
                  <span
                    className={cn(
                      "block w-2 h-2 rounded-full",
                      status === "connected"
                        ? "bg-success"
                        : "bg-warning animate-pulse",
                    )}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {status === "connected" ? "Connected" : "Connecting..."}
              </TooltipContent>
            </Tooltip>

            {/* Add Group button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={onAddGroup}>
                  <Plus className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add group</TooltipContent>
            </Tooltip>

            {/* Share button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={onShareClick}>
                  <Share2 className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share list</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </nav>
  );
}
