import type { TodoItem as TodoItemType } from "../../types/todo";

import { useState } from "react";
import { Trash2, MoreVertical, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
  const [editValue, setEditValue] = useState(item.text);

  const handleSaveEdit = () => {
    if (editValue.trim()) {
      onUpdate(item.id, editValue.trim());
      setIsEditDialogOpen(false);
    }
  };

  const handleCancelEdit = () => {
    setEditValue(item.text);
    setIsEditDialogOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 py-1 rounded-md hover:bg-muted/50 transition-colors">
        <button
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
          type="button"
          onClick={() => onToggle(item.id)}
        >
          <Checkbox
            checked={item.done ?? false}
            className="h-4 w-4 rounded-full data-[state=checked]:bg-success data-[state=checked]:border-success pointer-events-none"
          />

          <span
            className={cn(
              "flex-1 text-sm transition-all",
              item.done && "line-through text-muted-foreground",
            )}
          >
            {item.text}
          </span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-6 w-6" size="icon" variant="icon-button">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setEditValue(item.text);
                setIsEditDialogOpen(true);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit item</DialogTitle>
            <DialogDescription>
              Make changes to your todo item.
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
