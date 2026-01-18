import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Share2, Plus, MoreVertical, FileText, Edit } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { EditTextDialog } from "./EditTextDialog";

interface TopNavbarProps {
  title: string;
  onTitleChange: (title: string) => void;
  onShareClick: () => void;
  onBatchImportClick: () => void;
  onAddGroup: () => void;
  status: "connected" | "connecting";
  completedCount: number;
  totalCount: number;
}

export function TopNavbar({
  title,
  onTitleChange,
  onShareClick,
  onBatchImportClick,
  onAddGroup,
  status,
  completedCount,
  totalCount,
}: TopNavbarProps) {
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);

  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

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

            <h1 className="flex-1 min-w-0 text-lg font-semibold truncate">
              {title}
            </h1>
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

            {/* More options dropdown */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>More options</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsRenameDialogOpen(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Rename list
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onShareClick}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share list
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onBatchImportClick}>
                  <FileText className="w-4 h-4 mr-2" />
                  Batch import
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <EditTextDialog
        open={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
        onSave={onTitleChange}
        title="Rename List"
        placeholder="Enter list name..."
        initialValue={title}
        submitLabel="Rename"
      />
    </nav>
  );
}
