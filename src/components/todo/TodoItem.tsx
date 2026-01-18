import type { TodoItem as TodoItemType } from '../../types/todo';

import { useState } from 'react';
import { Trash2, MoreVertical, Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { EditTextDialog } from './EditTextDialog';

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
      <div className="flex items-center gap-4 rounded-md hover:bg-muted/50 transition-colors">
        <button
          className="flex items-center gap-4 flex-1 min-w-0 text-left"
          type="button"
          onClick={() => onToggle(item.id)}
        >
          <Checkbox
            checked={item.done ?? false}
            className="h-4 w-4 rounded-full data-[state=checked]:bg-success data-[state=checked]:border-success pointer-events-none"
          />

          <span
            className={cn(
              'flex-1 py-1 text-sm transition-all',
              item.done && 'line-through text-muted-foreground',
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
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
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

      <EditTextDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={(text) => onUpdate(item.id, text)}
        title="Edit Item"
        placeholder="Enter item text..."
        initialValue={item.text}
        submitLabel="Save"
      />
    </>
  );
}
