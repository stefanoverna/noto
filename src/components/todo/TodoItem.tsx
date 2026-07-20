import type { TodoItem as TodoItemType } from "../../types/todo";

import { useState } from "react";
import { Trash2, MoreVertical, Pencil, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { EditItemDialog } from "./EditItemDialog";
import { TodoItemRow } from "./TodoItemRow";

import { Button } from "@/components/ui/button";
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
  onUpdate: (
    itemId: string,
    updates: { text: string; description: string },
  ) => void;
  onDelete: (itemId: string) => void;
}

export function TodoItem({
  item,
  onToggle,
  onUpdate,
  onDelete,
}: TodoItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  return (
    <>
      <TodoItemRow
        ref={setNodeRef}
        className={cn(
          "group/item hover:bg-muted/50",
          isDragging && "opacity-50",
        )}
        description={item.description}
        done={item.done ?? false}
        gripSlot={
          <button
            aria-label="Drag to reorder"
            className="h-9 w-6 shrink-0 flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground cursor-grab touch-none opacity-0 group-hover/item:opacity-100 focus-visible:opacity-100 transition-opacity"
            type="button"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>
        }
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
        }}
        text={item.text}
        trailingSlot={
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
        }
        onToggle={() => onToggle(item.id)}
      />

      <EditItemDialog
        initialDescription={item.description}
        initialText={item.text}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={(updates) => onUpdate(item.id, updates)}
      />
    </>
  );
}
