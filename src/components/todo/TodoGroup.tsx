import type {
  TodoGroup as TodoGroupType,
  TodoItem as TodoItemType,
} from "../../types/todo";

import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Trash2,
  Plus,
  MoreVertical,
  Pencil,
} from "lucide-react";

import { TodoItem } from "./TodoItem";
import { EditTextDialog } from "./EditTextDialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TodoGroupProps {
  group: TodoGroupType;
  items: TodoItemType[];
  onAddItem: (groupId: string, text: string) => void;
  onUpdateGroup: (groupId: string, updates: Partial<TodoGroupType>) => void;
  onDeleteGroup: (groupId: string) => void;
  onToggleItem: (itemId: string) => void;
  onUpdateItem: (itemId: string, text: string) => void;
  onDeleteItem: (itemId: string) => void;
}

export function TodoGroup({
  group,
  items,
  onAddItem,
  onUpdateGroup,
  onDeleteGroup,
  onToggleItem,
  onUpdateItem,
  onDeleteItem,
}: TodoGroupProps) {
  const [newItemText, setNewItemText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const completedCount = items.filter((i) => i.done).length;
  const totalCount = items.length;

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAddItem = () => {
    if (newItemText.trim()) {
      onAddItem(group.id, newItemText.trim());
      setNewItemText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddItem();
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <button
              className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
              type="button"
              onClick={handleToggleExpand}
            >
              <div className="h-8 w-6 shrink-0 flex items-center justify-center">
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </div>

              <span className="text-base font-semibold flex-1">{group.name}</span>
            </button>

            {totalCount > 0 && (
              <span className="text-sm text-muted-foreground tabular-nums">
                {completedCount}/{totalCount}
              </span>
            )}

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
                  onClick={() => onDeleteGroup(group.id)}
                >
                  <Trash2 className="h-5 w-5 mr-2.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent>
            {items.map((item) => (
              <TodoItem
                key={item.id}
                item={item}
                onDelete={onDeleteItem}
                onToggle={onToggleItem}
                onUpdate={onUpdateItem}
              />
            ))}

            <div className="flex items-center gap-5 py-1">
              <div className="h-5 w-5 rounded-full border-2 border-dashed border-muted-foreground/30 shrink-0" />
              <div
                className={cn(
                  "flex items-center gap-5 flex-1 rounded-md -ml-1 pl-1 transition-colors",
                  isFocused ? "bg-muted/50" : "hover:bg-muted/30",
                )}
              >
                <input
                  className="flex-1 py-1.5 text-base bg-transparent outline-none placeholder:text-muted-foreground/50"
                  placeholder="Add new item..."
                  value={newItemText}
                  onBlur={() => setIsFocused(false)}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onKeyDown={handleKeyDown}
                />
                {newItemText && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="h-9 w-9 text-primary hover:bg-primary/10"
                        size="icon"
                        variant="ghost"
                        onClick={handleAddItem}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add item</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <EditTextDialog
        initialValue={group.name}
        open={isEditDialogOpen}
        placeholder="Enter group name..."
        submitLabel="Save"
        title="Edit Group"
        onOpenChange={setIsEditDialogOpen}
        onSave={(name) => onUpdateGroup(group.id, { name })}
      />
    </>
  );
}
