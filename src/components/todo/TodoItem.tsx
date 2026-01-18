import type { TodoItem as TodoItemType } from "../../types/todo";

import { useState } from "react";
import { Trash2, MoreVertical, Pencil } from "lucide-react";

import { EditTextDialog } from "./EditTextDialog";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TodoItemProps {
  item: TodoItemType;
  onToggle: (itemId: string) => void;
  onUpdate: (itemId: string, text: string) => void;
  onDelete: (itemId: string) => void;
}

export function TodoItem({
  item,
  onToggle,
  onUpdate,
  onDelete,
}: TodoItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-5 rounded-md hover:bg-muted/50 transition-colors">
        <button
          className="flex items-center gap-4 flex-1 min-w-0 text-left"
          type="button"
          onClick={() => onToggle(item.id)}
        >
          <Checkbox
            checked={item.done ?? false}
            className="h-5 w-5 rounded-full data-[state=checked]:bg-success data-[state=checked]:border-success pointer-events-none"
          />

          <span
            className={cn(
              "flex-1 py-1.5 text-base transition-all leading-tight",
              item.done && "line-through text-muted-foreground",
            )}
          >
            {item.text}
          </span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-9 w-9" size="icon" variant="icon-button">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <Pencil className="h-5 w-5 mr-2.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-5 w-5 mr-2.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditTextDialog
        initialValue={item.text}
        open={isEditDialogOpen}
        placeholder="Enter item text..."
        submitLabel="Save"
        title="Edit Item"
        onOpenChange={setIsEditDialogOpen}
        onSave={(text) => onUpdate(item.id, text)}
      />
    </>
  );
}
